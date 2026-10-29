#!/usr/bin/env bash
# ============================================================================
# Applies supabase/migrations/001_schema.sql and supabase/seed.sql to a real
# Supabase project. Run this once after creating the project and setting
# DATABASE_URL (Project Settings -> Database -> Connection string -> URI,
# with your password filled in).
#
# Usage:
#   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
#   ./scripts/setup-supabase.sh
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"
SEED_FILE="$ROOT_DIR/supabase/seed.sql"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set."
  echo ""
  echo "Find it in your Supabase dashboard under Project Settings -> Database"
  echo "-> Connection string -> URI, then:"
  echo ""
  echo "  export DATABASE_URL=\"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\""
  echo "  $0"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is not installed. Install the PostgreSQL client and re-run."
  echo "  macOS:  brew install libpq && brew link --force libpq"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  exit 1
fi

echo "==> Applying migrations ($MIGRATIONS_DIR)"
for migration in "$MIGRATIONS_DIR"/*.sql; do
  echo "    - $(basename "$migration")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

echo "==> Applying seed data ($SEED_FILE)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"

echo ""
echo "==> Verifying row counts"
psql "$DATABASE_URL" -c "
  select 'itineraries' as table_name, count(*) from itineraries
  union all select 'legs', count(*) from legs
  union all select 'waypoints', count(*) from waypoints
  union all select 'journal_entries', count(*) from journal_entries;
"

echo ""
echo "Done. Now set these in .env.local (Project Settings -> API):"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon public key]"
