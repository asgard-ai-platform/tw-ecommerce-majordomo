#!/usr/bin/env bash
# Sync the 29 tw-ecom-* skills from the upstream asgard-skills repo into ./skills/.
#
# Source of truth: https://github.com/asgard-ai-platform/skills
# Default upstream path: ../skills (i.e. ../skills relative to this plugin repo)
#
# Usage:
#   ./scripts/sync-skills.sh                   # use default ../skills
#   SKILLS_SRC=/path/to/skills sync-skills.sh  # explicit override
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SKILLS_SRC:-$ROOT/../skills}"

if [ ! -d "$SRC" ]; then
  echo "Upstream skills repo not found at: $SRC" >&2
  echo "Clone it first: git clone https://github.com/asgard-ai-platform/skills $SRC" >&2
  exit 1
fi

DEST="$ROOT/skills"
mkdir -p "$DEST"

count=0
for d in "$SRC"/tw-ecom-*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    "$d" "$DEST/$name/"
  count=$((count + 1))
done

echo "Synced $count tw-ecom-* skills into $DEST"
