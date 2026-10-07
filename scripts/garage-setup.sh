#!/usr/bin/env bash
# One-shot Garage (S3) setup: config + credentials + container + public website + CORS.
# Idempotent — safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="scripts/.env.local"
CONFIG="scripts/garage/garage.toml.local"
COMPOSE="docker-compose -f scripts/docker-compose.yml --env-file $ENV_FILE"

# 1. garage config with a fresh rpc secret
if [ ! -f "$CONFIG" ]; then
  sed "s/RPC_SECRET_PLACEHOLDER/$(openssl rand -hex 32)/" \
    scripts/garage/garage.toml.example > "$CONFIG"
  echo "generated $CONFIG"
fi

# 2. S3 credentials in .env.local
touch "$ENV_FILE"
if [ -s "$ENV_FILE" ] && [ -n "$(tail -c 1 "$ENV_FILE")" ]; then echo >> "$ENV_FILE"; fi # file must end with newline
grep -q '^GARAGE_ACCESS_KEY=' "$ENV_FILE" || echo "GARAGE_ACCESS_KEY=GK$(openssl rand -hex 16)" >> "$ENV_FILE"
grep -q '^GARAGE_SECRET_KEY=' "$ENV_FILE" || echo "GARAGE_SECRET_KEY=$(openssl rand -hex 32)" >> "$ENV_FILE"
grep -q '^GARAGE_BUCKET=' "$ENV_FILE" || echo "GARAGE_BUCKET=cude" >> "$ENV_FILE"
BUCKET=$(grep '^GARAGE_BUCKET=' "$ENV_FILE" | cut -d= -f2)

# 3. start garage
$COMPOSE up -d garage

# 4. wait for the S3 API (any HTTP answer, including 403, means it is up)
echo -n "waiting for garage"
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:3900/"; then echo " ready"; break; fi
  echo -n "."
  sleep 1
done

# 5. public read endpoint: http://<bucket>.localhost:3902/<key>
#    retry: --default-bucket may still be creating the bucket
for _ in $(seq 1 5); do
  if docker exec garage /garage bucket website --allow "$BUCKET" >/dev/null 2>&1; then break; fi
  sleep 1
done

# 6. bucket CORS so the browser (localhost:5173) can PUT presigned uploads
node scripts/garage-cors.mjs

echo ""
echo "Garage ready:"
echo "  S3 endpoint : http://localhost:3900   (region: garage, path-style)"
echo "  public read : http://$BUCKET.localhost:3902/<key>"
echo "  credentials : $ENV_FILE  (GARAGE_ACCESS_KEY / GARAGE_SECRET_KEY)"
echo "  server .env : copy S3_* values from server/.env.example, same key pair"
