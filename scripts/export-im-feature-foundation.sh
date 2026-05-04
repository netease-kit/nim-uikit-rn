#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <output-dir>" >&2
  exit 1
fi

OUTPUT_DIR="$1"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/skills/im-feature-foundation"
TARGET_DIR="$OUTPUT_DIR/im-feature-foundation"

mkdir -p "$OUTPUT_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

cp "$SOURCE_DIR/SKILL.md" "$TARGET_DIR/SKILL.md"
cp "$SOURCE_DIR/README.md" "$TARGET_DIR/README.md"
cp -R "$SOURCE_DIR/evals" "$TARGET_DIR/evals"
cp -R "$SOURCE_DIR/references" "$TARGET_DIR/references"

echo "Exported im-feature-foundation to $TARGET_DIR"
