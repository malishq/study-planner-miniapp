#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(basename "$(git rev-parse --show-toplevel)")
REMOTE=$(git remote get-url origin)
BASE_PATH="/$REPO/" npm run build
touch dist/.nojekyll
rm -rf .deploy && cp -R dist .deploy
cd .deploy && git init -q -b gh-pages && git add -A && git commit -qm "Deploy $(date +%F)" && git push -f "$REMOTE" gh-pages:gh-pages
cd .. && rm -rf .deploy
echo "gh-pages pushed for $REPO"
