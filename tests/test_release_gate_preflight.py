from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_verify_release_has_python_preflight_with_actionable_hint() -> None:
    verify_release = (ROOT / "scripts" / "verify_release.sh").read_text(encoding="utf-8")
    assert "preflight_python_environment()" in verify_release
    assert "missing Python module" in verify_release
    assert "require_python_module pytest" in verify_release
    assert "pip install -r requirements.txt && pip install -e ." in verify_release


def test_verify_release_has_frontend_preflight_with_actionable_hint() -> None:
    verify_release = (ROOT / "scripts" / "verify_release.sh").read_text(encoding="utf-8")
    assert "preflight_frontend_environment()" in verify_release
    assert "ensure_node_toolchain" in verify_release
    assert "frontend/node_modules is missing" in verify_release
    assert "cd frontend && npm install" in verify_release


def test_verify_release_searches_common_local_node_toolchains() -> None:
    verify_release = (ROOT / "scripts" / "verify_release.sh").read_text(encoding="utf-8")
    assert 'build_home_candidates()' in verify_release
    assert '.nvm' in verify_release
    assert 'getent passwd "$current_user"' in verify_release
    assert '"/home/$current_user"' in verify_release
    assert '.tools/node' in verify_release
