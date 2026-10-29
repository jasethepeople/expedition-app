#!/usr/bin/env bash
# ============================================================================
# Drops all tables/functions created by 001_schema.sql and 002_hardening.sql.
# Destructive — use only in a dev/staging Supabase project you're happy to
# wipe and re-seed.
#
# Usage:
#   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
#   ./scripts/reset-supabase.sh
# ============================================================================
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set. See setup-supabase.sh for how to find it."
  exit 1
fi

read -p "This will DROP journal_entries, waypoints, legs, itineraries. Type 'reset' to continue: " confirm
if [[ "$confirm" != "reset" ]]; then
  echo "Aborted."
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
drop table if exists journal_entries cascade;
drop table if exists waypoints cascade;
drop table if exists legs cascade;
drop table if exists itineraries cascade;
drop type if exists realm_type cascade;
drop function if exists set_updated_at() cascade;
drop function if exists check_journal_rate_limit() cascade;
SQL

echo "Dropped. Re-run ./scripts/setup-supabase.sh to recreate schema + seed."
