-- ============================================================================
-- 002_harden_journal.sql
-- Tightens journal_entries beyond bare public-insert:
--   1. Bounds on notes length and media_urls size (stop empty/huge payloads).
--   2. A trigger-based per-waypoint rate limit, since RLS policies alone
--      can't express "no more than N inserts per minute" — that needs to
--      inspect prior rows, which happens in a BEFORE INSERT trigger instead.
--   3. Explicit denial of update/delete for the anon role (defense in depth:
--      no policy already means "deny" under RLS, but this makes the intent
--      readable instead of relying on absence).
-- ============================================================================

-- 1. Input bounds -------------------------------------------------------
alter table journal_entries
  add constraint journal_notes_length check (char_length(notes) between 1 and 2000);

alter table journal_entries
  add constraint journal_media_count check (array_length(media_urls, 1) is null or array_length(media_urls, 1) <= 10);

alter table journal_entries
  add constraint journal_author_length check (author is null or char_length(author) <= 80);

-- 2. Basic write throttling ----------------------------------------------
-- Blocks more than 5 journal entries from the same waypoint within 60 seconds.
-- This is a coarse anti-spam guard, not per-user rate limiting (the schema
-- has no auth'd user column) — tighten further if you add Supabase Auth.
create or replace function enforce_journal_rate_limit()
returns trigger as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from journal_entries
  where waypoint_id = new.waypoint_id
    and created_at > now() - interval '60 seconds';

  if recent_count >= 5 then
    raise exception 'Rate limit: too many journal entries for this waypoint in the last minute. Try again shortly.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_journal_rate_limit
  before insert on journal_entries
  for each row execute function enforce_journal_rate_limit();

-- 3. Explicit deny for update/delete under anon/public --------------------
-- No-op functionally (absence of a policy already denies), but documents
-- the intent so a future migration doesn't accidentally open it back up.
create policy "deny public update journal" on journal_entries
  for update using (false);
create policy "deny public delete journal" on journal_entries
  for delete using (false);

-- itineraries/legs/waypoints already have no insert/update/delete policies,
-- so anon and authenticated roles can't modify tour content — only the
-- service_role key (used server-side, e.g. an admin script) can, since
-- service_role bypasses RLS entirely.
