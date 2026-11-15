#!/usr/bin/env bash
# Build the page and deploy it to https://cinderella.kikkey.com (needs CLOUDFLARE_API_TOKEN; CLOUDFLARE_ACCOUNT_ID is resolved from the kikkey.com zone)
set -euo pipefail
cd "$(dirname "$0")/.."
node build.mjs
mkdir -p deploy/public && cp index.html deploy/public/index.html
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  CLOUDFLARE_ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=kikkey.com" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['account']['id'])")
  export CLOUDFLARE_ACCOUNT_ID
fi
cd deploy && npx -y wrangler@4.156.0 deploy
