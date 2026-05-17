#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail_with_hint() {
  local message="$1"
  echo "[verify-release] ${message}" >&2
  exit 1
}

log_info() {
  local message="$1"
  echo "[verify-release] ${message}"
}

build_home_candidates() {
  local candidates=()
  local current_user=""
  local passwd_home=""

  if [[ -n "${HOME:-}" ]]; then
    candidates+=("$HOME")
  fi

  current_user="$(id -un 2>/dev/null || true)"
  if command -v getent >/dev/null 2>&1 && [[ -n "$current_user" ]]; then
    passwd_home="$(getent passwd "$current_user" | cut -d: -f6)"
    if [[ -n "$passwd_home" ]]; then
      candidates+=("$passwd_home")
    fi
  fi

  if [[ -n "$current_user" ]]; then
    candidates+=("/home/$current_user")
  fi

  printf '%s\n' "${candidates[@]}" | awk 'NF && !seen[$0]++'
}

require_python_module() {
  local module="$1"
  local install_hint="$2"
  if ! python3 -c "import ${module}" >/dev/null 2>&1; then
    fail_with_hint "missing Python module '${module}'. ${install_hint}"
  fi
}

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  local fallback
  local home_dir
  fallback="$(find /tmp -type f -path '*/bin/node' 2>/dev/null | sort | tail -n 1 || true)"
  if [[ -n "$fallback" ]]; then
    echo "$fallback"
    return 0
  fi

  while IFS= read -r home_dir; do
    [[ -z "$home_dir" ]] && continue
    fallback="$(find "$home_dir/.nvm" -type f -path '*/bin/node' 2>/dev/null | sort | tail -n 1 || true)"
    if [[ -n "$fallback" ]]; then
      echo "$fallback"
      return 0
    fi

    fallback="$(find "$home_dir/projects" -type f -path '*/.tools/node*/bin/node' 2>/dev/null | sort | tail -n 1 || true)"
    if [[ -n "$fallback" ]]; then
      echo "$fallback"
      return 0
    fi
  done < <(build_home_candidates)

  fallback="$(find "$HOME/.cursor-server/bin" -type f -path '*/node' 2>/dev/null | sort | tail -n 1 || true)"
  if [[ -n "$fallback" ]]; then
    echo "$fallback"
    return 0
  fi

  echo "node not found in PATH or /tmp node toolchains" >&2
  return 1
}

find_npm_cli() {
  if command -v npm >/dev/null 2>&1; then
    local npm_bin
    npm_bin="$(command -v npm)"
    if [[ -x "$npm_bin" ]]; then
      echo "$npm_bin"
      return 0
    fi
  fi

  local fallback
  local home_dir
  fallback="$(find /tmp -type f -path '*/lib/node_modules/npm/bin/npm-cli.js' 2>/dev/null | sort | tail -n 1 || true)"
  if [[ -n "$fallback" ]]; then
    echo "$fallback"
    return 0
  fi

  while IFS= read -r home_dir; do
    [[ -z "$home_dir" ]] && continue
    fallback="$(find "$home_dir/.nvm" -type f -path '*/lib/node_modules/npm/bin/npm-cli.js' 2>/dev/null | sort | tail -n 1 || true)"
    if [[ -n "$fallback" ]]; then
      echo "$fallback"
      return 0
    fi

    fallback="$(find "$home_dir/projects" -type f -path '*/.tools/node*/lib/node_modules/npm/bin/npm-cli.js' 2>/dev/null | sort | tail -n 1 || true)"
    if [[ -n "$fallback" ]]; then
      echo "$fallback"
      return 0
    fi
  done < <(build_home_candidates)

  return 1
}

NODE_BIN=""
NPM_CLI=""
NODE_DIR=""

ensure_node_toolchain() {
  if [[ -n "$NODE_BIN" && -n "$NODE_DIR" ]]; then
    return 0
  fi

  NODE_BIN="$(find_node)"
  NPM_CLI="$(find_npm_cli || true)"
  NODE_DIR="$(dirname "$NODE_BIN")"
}

run_npm() {
  ensure_node_toolchain
  if [[ -z "${NPM_CLI:-}" ]]; then
    echo "npm CLI not available" >&2
    return 1
  fi
  if [[ "$NPM_CLI" == *.js ]]; then
    PATH="$NODE_DIR:$PATH" "$NODE_BIN" "$NPM_CLI" "$@"
    return 0
  fi
  if [[ -x "$NPM_CLI" ]]; then
    PATH="$NODE_DIR:$PATH" "$NPM_CLI" "$@"
    return 0
  fi
  PATH="$NODE_DIR:$PATH" "$NODE_BIN" "$NPM_CLI" "$@"
}

preflight_python_environment() {
  log_info "python preflight"
  require_python_module pytest "Install project dependencies first: pip install -r requirements.txt && pip install -e ."
}

preflight_frontend_environment() {
  log_info "frontend preflight"
  ensure_node_toolchain
  if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
    local install_cmd="cd frontend && npm install"
    if [[ -f "$ROOT_DIR/frontend/package-lock.json" ]]; then
      install_cmd="cd frontend && npm ci"
    fi
    fail_with_hint "frontend/node_modules is missing. Run '${install_cmd}' before verify_release. Detected Node at '${NODE_BIN}'${NPM_CLI:+ and npm at '${NPM_CLI}'}."
  fi
}

print_environment_diagnostics() {
  log_info "environment diagnostics"

  if command -v python3 >/dev/null 2>&1; then
    log_info "python: $(command -v python3) ($("$(command -v python3)" --version 2>&1))"
  else
    log_info "python: missing from PATH"
  fi

  if command -v pytest >/dev/null 2>&1; then
    log_info "pytest: $(command -v pytest)"
  else
    log_info "pytest: not found in PATH (module import may still work via python3 -m pytest)"
  fi

  if ensure_node_toolchain >/dev/null 2>&1; then
    local node_version=""
    node_version="$("$NODE_BIN" --version 2>/dev/null || true)"
    log_info "node: ${NODE_BIN}${node_version:+ (${node_version})}"
    if [[ -n "${NPM_CLI:-}" ]]; then
      if [[ "$NPM_CLI" == *.js ]]; then
        local npm_version=""
        npm_version="$("$NODE_BIN" "$NPM_CLI" --version 2>/dev/null || true)"
        log_info "npm: ${NPM_CLI}${npm_version:+ (${npm_version})}"
      else
        local npm_version=""
        npm_version="$("$NPM_CLI" --version 2>/dev/null || true)"
        log_info "npm: ${NPM_CLI}${npm_version:+ (${npm_version})}"
      fi
    else
      log_info "npm: CLI not found; frontend checks will fall back to direct binaries where possible"
    fi
  else
    log_info "node: not found by PATH or fallback search"
  fi

  if [[ -d "$ROOT_DIR/frontend/node_modules" ]]; then
    log_info "frontend deps: present at $ROOT_DIR/frontend/node_modules"
  else
    log_info "frontend deps: missing at $ROOT_DIR/frontend/node_modules"
  fi
}

run_frontend_bin() {
  local rel="$1"
  shift
  (
    cd "$ROOT_DIR/frontend"
    PATH="$NODE_DIR:$PATH" "$NODE_BIN" "node_modules/$rel" "$@"
  )
}

run_python_checks() {
  preflight_python_environment

  log_info "trust claims"
  python3 "$ROOT_DIR/scripts/check_trust_claims.py"

  log_info "data/ml contracts"
  python3 "$ROOT_DIR/scripts/check_data_ml_contracts.py"

  log_info "frontend/backend norm sync"
  python3 "$ROOT_DIR/scripts/check_water_norms_sync.py"

  log_info "pytest"
  python3 -m pytest "$ROOT_DIR/tests" -q
}

run_frontend_checks() {
  preflight_frontend_environment

  log_info "frontend lint"
  if [[ -n "${NPM_CLI:-}" ]]; then
    (
      cd "$ROOT_DIR/frontend"
      run_npm run lint
    )
  else
    run_frontend_bin "eslint/bin/eslint.js" . --max-warnings=0
  fi

  log_info "frontend typecheck"
  if [[ -n "${NPM_CLI:-}" ]]; then
    (
      cd "$ROOT_DIR/frontend"
      run_npm run typecheck
    )
  else
    run_frontend_bin "typescript/bin/tsc" --noEmit
  fi

  log_info "frontend build"
  if [[ -n "${NPM_CLI:-}" ]]; then
    (
      cd "$ROOT_DIR/frontend"
      run_npm run build
    )
  else
    run_frontend_bin "next/dist/bin/next" build
  fi
}

main() {
  local run_python="true"
  local run_frontend="true"
  local run_diagnostics="false"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --diagnose)
        run_diagnostics="true"
        ;;
      --skip-python)
        run_python="false"
        ;;
      --skip-frontend)
        run_frontend="false"
        ;;
      *)
        echo "unknown option: $1" >&2
        echo "usage: $0 [--diagnose] [--skip-python] [--skip-frontend]" >&2
        return 2
        ;;
    esac
    shift
  done

  if [[ "$run_diagnostics" == "true" ]]; then
    print_environment_diagnostics
  fi

  if [[ "$run_python" == "false" && "$run_frontend" == "false" ]]; then
    if [[ "$run_diagnostics" == "true" ]]; then
      log_info "diagnostics completed"
      return 0
    fi
    echo "nothing to run: both python and frontend checks were skipped" >&2
    return 2
  fi

  if [[ "$run_python" == "true" ]]; then
    run_python_checks
  fi
  if [[ "$run_frontend" == "true" ]]; then
    run_frontend_checks
  fi
  log_info "all checks passed"
}

main "$@"
