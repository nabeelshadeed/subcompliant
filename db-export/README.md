## SubCompliant database export

This folder contains everything you need to snapshot the **entire Postgres database** used by this site into a folder on your Desktop.

The application schema is defined in:

- `src/lib/db/schema.ts` – all tables, enums, and types
- `src/lib/db/relations.ts` – relations between tables
- `drizzle.config.ts` – Drizzle configuration (points at `schema.ts` and the `DATABASE_URL`)

The commands below will create a folder `~/Desktop/subcompliant-db` and dump the full database into it.

> You must have the `psql` and `pg_dump` CLI tools installed and be able to connect to the same Postgres instance as `DATABASE_URL`.

### 1. Create the Desktop folder

Run this in your terminal:

```bash
mkdir -p ~/Desktop/subcompliant-db
```

### 2. Export the entire database (custom dump)

This uses `DATABASE_URL` from your environment:

```bash
cd "$(dirname "$0")/.."

# Load environment (edit if you use a different env loader)
export $(grep -v '^#' .env.local 2>/dev/null | xargs) || true

./db-export/export-db.sh
```

This will create:

- `~/Desktop/subcompliant-db/subcompliant-db.dump` – compressed, restorable dump of the whole database.

### 3. (Optional) Export a schema-only SQL file

To also get a pure SQL representation of the schema:

```bash
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.local 2>/dev/null | xargs) || true

./db-export/export-schema.sh
```

This will create:

- `~/Desktop/subcompliant-db/schema.sql` – schema-only SQL (no data).

### 4. Restoring the dump elsewhere

On another machine or database:

```bash
createdb subcompliant_restore
pg_restore -d subcompliant_restore -Fc ~/Desktop/subcompliant-db/subcompliant-db.dump
```

