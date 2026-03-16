#!/usr/bin/env bash
set -euo pipefail

# Export the entire Postgres database used by this app
# into ~/Desktop/subcompliant-db/subcompliant-db.dump

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Please set it (e.g. from .env.local) and re-run."
  exit 1
fi

DESKTOP_DIR="${HOME}/Desktop/subcompliant-db"
mkdir -p "${DESKTOP_DIR}"

echo "Exporting database to ${DESKTOP_DIR}/subcompliant-db.dump"

pg_dump -Fc "${DATABASE_URL}" -f "${DESKTOP_DIR}/subcompliant-db.dump"

echo "Done."

