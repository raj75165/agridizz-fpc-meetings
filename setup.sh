#!/usr/bin/env bash
# ============================================================
#  FPO ACCOUNTING SOFTWARE — Mac/Linux Setup
#  Opens index.html in the default browser.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INDEX="$SCRIPT_DIR/index.html"

if [ ! -f "$INDEX" ]; then
  echo ""
  echo "  ERROR: index.html not found in $SCRIPT_DIR"
  echo "  Please make sure setup.sh and index.html are in the same folder."
  echo ""
  exit 1
fi

# Make this script executable if it is not already (one-time, harmless guard)
if [ ! -x "$0" ]; then
  chmod +x "$0"
fi

echo "Opening FPO ACCOUNTING SOFTWARE..."

if command -v xdg-open &>/dev/null; then
  # Linux
  xdg-open "$INDEX"
elif command -v open &>/dev/null; then
  # macOS
  open "$INDEX"
else
  echo ""
  echo "  Could not detect a browser opener (xdg-open / open)."
  echo "  Please open the following file manually in your browser:"
  echo "  $INDEX"
  echo ""
  exit 1
fi
