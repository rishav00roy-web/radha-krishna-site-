#!/usr/bin/env bash
# Dump the Supabase Postgres database to ./backups/<timestamp>.sql.gz
# Usage: SUPABASE_DB_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" ./scripts/backup.sh
# Restore: gunzip -c backups/<file>.sql.gz | psql "$SUPABASE_DB_URL"
set -euo pipefail
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to the database connection string (Project Settings -> Database).}"
mkdir -p backups
out="backups/$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges --schema=public --schema=storage | gzip > "$out"
echo "Wrote $out"
