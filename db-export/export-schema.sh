#!/usr/bin/env bash
set -euo pipefail

# Export schema-only SQL for the Postgres database
# into ~/Desktop/subcompliant-db/schema.sql

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Please set it (e.g. from .env.local) and re-run."
  exit 1
fi

DESKTOP_DIR="${HOME}/Desktop/subcompliant-db"
mkdir -p "${DESKTOP_DIR}"

echo "Exporting schema to ${DESKTOP_DIR}/schema.sql"

pg_dump --schema-only "${DATABASE_URL}" -f "${DESKTOP_DIR}/schema.sql"

echo "Done."

