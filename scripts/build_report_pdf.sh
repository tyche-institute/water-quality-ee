#!/usr/bin/env bash
# build_report_pdf.sh — render submission/final_report.md → submission/final_report.pdf
#
# Tries pandoc engines in order of preference:
#   1. xelatex / lualatex / pdflatex  (LaTeX route — best typography)
#   2. weasyprint                     (HTML+CSS route — pure-Python fallback)
#
# WeasyPrint comes from .venv (installed via requirements / `pip install weasyprint`).
# Fonts: DejaVu Serif/Sans (system).

set -euo pipefail
cd "$(dirname "$0")/.."

INPUT="submission/final_report.md"
OUTPUT="submission/final_report.pdf"

if [ ! -f "$INPUT" ]; then
  echo "ERROR: $INPUT not found" >&2
  exit 1
fi

PANDOC_COMMON=(
  --from=markdown+yaml_metadata_block+pipe_tables+raw_attribute
  --resource-path="submission"
  --metadata=lang=et
  --shift-heading-level-by=0
  -V geometry:a4paper
  -V geometry:margin=1.8cm
  -V documentclass=article
  -V fontsize=10pt
  -V linestretch=1.15
  -V colorlinks=true
  -V linkcolor=blue
  -V urlcolor=blue
)

choose_engine() {
  for eng in xelatex lualatex pdflatex; do
    if command -v "$eng" >/dev/null 2>&1; then
      echo "$eng"; return 0
    fi
  done
  if [ -x .venv/bin/weasyprint ]; then
    echo "weasyprint"; return 0
  fi
  if command -v weasyprint >/dev/null 2>&1; then
    echo "weasyprint"; return 0
  fi
  return 1
}

ENGINE="$(choose_engine || true)"
if [ -z "${ENGINE:-}" ]; then
  echo "ERROR: no PDF engine found. Install texlive-xetex OR  pip install weasyprint" >&2
  exit 2
fi

echo "PDF engine: $ENGINE"

if [ "$ENGINE" = "weasyprint" ]; then
  # weasyprint route: pandoc → HTML → weasyprint → PDF, with our CSS
  CSS="submission/.report.css"
  cat > "$CSS" <<'CSSEOF'
@page { size: A4; margin: 1.4cm 1.5cm 1.5cm 1.5cm; }
body  { font-family: "DejaVu Serif", "Liberation Serif", serif;
        font-size: 9pt; line-height: 1.22; color: #1f2937; }
h1    { font-size: 13pt; color: #0d6efd; margin: 0.7em 0 0.3em; }
h2    { font-size: 11pt; color: #0d6efd; margin: 0.6em 0 0.25em; }
h3    { font-size: 10pt; color: #1f2937; margin: 0.4em 0 0.2em; }
p     { margin: 0.25em 0; }
ul, ol { margin: 0.25em 0 0.25em 1.2em; padding: 0; }
li    { margin: 0.05em 0; }
table { border-collapse: collapse; margin: 0.4em 0; font-size: 8pt; }
th, td { border: 1px solid #d1d5db; padding: 2px 6px; }
th    { background: #e7f1ff; }
img   { max-width: 80%; height: auto; display: block; margin: 0.3em auto; }
code  { background: #f1f5f9; padding: 0 3px; border-radius: 3px;
        font-family: "DejaVu Sans Mono", monospace; font-size: 8pt; }
.title { font-size: 16pt; color: #0d6efd; font-weight: bold; }
.subtitle { font-size: 11pt; color: #6c757d; }
.author, .date { font-size: 10pt; color: #1f2937; }
hr    { border: none; border-top: 1px solid #d1d5db; margin: 0.8em 0; }
header.title-block-header { margin-bottom: 0.6em; }
CSSEOF

  HTML="submission/.report.html"
  pandoc "$INPUT" \
    --from=markdown+yaml_metadata_block+pipe_tables+raw_attribute \
    --to=html5 \
    --standalone \
    --resource-path="submission" \
    --css="$(basename "$CSS")" \
    --metadata=lang=et \
    --output="$HTML"
  if [ -x .venv/bin/weasyprint ]; then
    .venv/bin/weasyprint "$HTML" "$OUTPUT"
  else
    weasyprint "$HTML" "$OUTPUT"
  fi
  rm -f "$HTML" "$CSS"
else
  pandoc "$INPUT" \
    "${PANDOC_COMMON[@]}" \
    --pdf-engine="$ENGINE" \
    -V mainfont="DejaVu Serif" \
    -V monofont="DejaVu Sans Mono" \
    --output="$OUTPUT"
fi

echo "Wrote $OUTPUT"
[ -f "$OUTPUT" ] && du -h "$OUTPUT" | awk '{print "Size: "$1}'
