-- ============================================================================
-- 002_hardening.sql
-- Tightens the public-write surface on journal_entries beyond the bare
-- "insert with check (true)" from 001_schema.sql, and documents the
-- (intentional) full lockdown on itineraries/legs/waypoints writes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- itineraries / legs / waypoints: no insert/update/delete policies exist for
-- these tables anywhere, and RLS defaults to deny — so they are already
-- effectively admin-only (writable only via the Supabase dashboard, the
-- service_role key, or a future authenticated-admin policy). Nothing to
-- add here; this comment exists so that stays a deliberate choice, not an
-- oversight, if someone else edits this file later.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- journal_entries: validate content shape at the database layer, since the
-- anon key can write to this table directly from the client.
-- ----------------------------------------------------------------------------
alter table journal_entries
  add constraint journal_notes_not_blank check (btrim(notes) <> ''),
  add constraint journal_notes_length check (char_length(notes) <= 2000),
  add constraint journal_media_urls_count check (array_length(media_urls, 1) is null or array_length(media_urls, 1) <= 10),
  add constraint journal_author_length check (author is null or char_length(author) <= 80);

-- ----------------------------------------------------------------------------
-- Basic per-waypoint rate limiting: block inserts if the same waypoint has
-- received more than 20 entries in the last 60 seconds. This is a coarse
-- anti-spam guard, not real per-user/per-IP throttling — pair it with
-- Supabase's built-in API rate limits (Dashboard -> Auth/API settings) or a
-- Postgres extension like pg_net + an edge function for anything stricter.
-- ----------------------------------------------------------------------------
create or replace function check_journal_rate_limit()
returns trigger as $$
begin
  if (
    select count(*) from journal_entries
    where waypoint_id = new.waypoint_id
      and created_at > now() - interval '60 seconds'
  ) >= 20 then
    raise exception 'Rate limit exceeded for this waypoint — try again shortly.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_journal_rate_limit
  before insert on journal_entries
  for each row execute function check_journal_rate_limit();

-- ----------------------------------------------------------------------------
-- Replace the blanket "with check (true)" insert policy with one that still
-- allows anonymous inserts (the app has no auth system) but makes the intent
-- explicit and gives a single place to tighten further later (e.g. requiring
-- auth.uid() once user accounts exist).
-- ----------------------------------------------------------------------------
drop policy if exists "public insert journal" on journal_entries;
create policy "public insert journal (validated)" on journal_entries
  for insert
  with check (
    btrim(notes) <> ''
    and char_length(notes) <= 2000
  );

-- No update/delete policy is defined for journal_entries, so entries are
-- append-only from the client — intentional for an expedition log.
