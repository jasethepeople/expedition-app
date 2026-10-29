# Master World Tour & Expedition Beyond the Ice Wall

Interactive itinerary map built with Next.js 14, TypeScript, Tailwind, Supabase, and React-Leaflet.

Two itineraries share one dual-mode UI:
- **Known World** — a real, geo-accurate seven-leg circuit (Mercator-style dark basemap, gold route).
- **Beyond the Ice Wall** — an explicitly fictional, invented story continuation (polar-projection styling, cyan dashed route). It is presented in the UI as narrative fiction, not as real geography or verified history — several waypoints in this mode have no real-world coordinates at all (`fictional_coordinates` field) and render as story cards instead of map pins.

## Setup

```bash
npm install
cp .env.local.example .env.local   # add your Supabase URL + anon key
```

Create a Supabase project, then apply the schema and seed with one command:

```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
npm run db:setup
```

`scripts/setup-supabase.sh` runs every file in `supabase/migrations/` in order, then `supabase/seed.sql`, via `psql`, checks for a missing `DATABASE_URL`/`psql` up front with a clear message, and prints row counts at the end so you can confirm it worked. `npm run db:reset` drops everything back to empty (asks for confirmation first) if you need to re-seed during development.

### Security hardening (`supabase/migrations/002_hardening.sql`)

The base schema's `journal_entries` policy is bare public-insert (`with check (true)`). The second migration tightens it:
- Check constraints on `notes` (non-blank, ≤2000 chars), `media_urls` size (≤10), and `author` length (≤80) — stops empty or oversized payloads at the database layer, not just in the UI.
- A `BEFORE INSERT` trigger (`check_journal_rate_limit`) capping journal entries at 20 per waypoint per 60 seconds. RLS policies can't see prior rows to count them, so this needed a trigger rather than a policy.
- The insert policy is replaced with one whose `with check` states the notes-length rule explicitly, so there's an obvious place to add `auth.uid()` checks later if you add user accounts.
- `itineraries`/`legs`/`waypoints` already have no insert/update/delete policies for `anon`/`authenticated` in the base schema — RLS defaults to deny, so only a `service_role` key (server-side only) can modify tour content. This migration just documents that as intentional rather than an oversight.
- No update/delete policy exists for `journal_entries` either, so entries are append-only from the client by design.

`components/JournalLog.tsx` surfaces constraint and rate-limit errors from Supabase directly in the UI (a red inline message under the input) instead of failing silently — including a client-side 2000-char check so the common case never round-trips to the server just to bounce.

### Load-testing the journal insert flow

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon public key]"
node scripts/load-test-journal.mjs --waypoint <a-real-waypoint-uuid> --requests 200 --concurrency 20
```

Hits the Supabase REST API directly (not through the browser — this measures the database/API path, not client rendering), reports success/rate-limited/error counts and p50/p95/p99 latency, and cleans up every row it inserts afterward. At concurrency above the rate-limit threshold (20/waypoint/60s) you should see a mix of successes and "Rate limit exceeded" rejections — that's the trigger working as intended, not a failure. Grab a real waypoint UUID first with:

```bash
psql "$DATABASE_URL" -c "select id, name from waypoints limit 5;"
```

If you skip Supabase setup entirely, the app still runs — `lib/itinerary-data.ts` falls back to bundled demo data matching the seed exactly.

### Waypoint photos

Real (`known`) waypoints without a stored `image_urls` entry are enriched at request time with a photo pulled from Wikipedia's public REST summary API (`lib/wiki-images.ts`), cached for 7 days via Next's fetch cache. Fictional "Beyond the Ice Wall" waypoints intentionally keep the "no image on file" placeholder rather than borrow a real photo for an invented place. This requires outbound network access to `en.wikipedia.org`; swap in Supabase Storage + your own uploaded/licensed photos for production instead of relying on a third-party API long-term.

```bash
npm run dev
```

## Structure

```
app/page.tsx              → server component, fetches itineraries, composes the layout
components/WorldMap.tsx    → dual-mode Leaflet map, mode-aware tiles/route styling
components/RouteFlow.tsx   → horizontal node timeline of legs, click-to-focus
components/WaypointDrawer.tsx → slide-in detail panel + image gallery
components/JournalLog.tsx  → per-waypoint notes, Supabase-backed with local fallback
components/ModeToggle.tsx  → signature compass-rose Known/Beyond toggle
lib/store.ts               → Zustand store (mode, active waypoint, drawer state)
lib/itinerary-data.ts      → Supabase fetch + bundled fallback data
supabase/migrations/       → schema
supabase/seed.sql          → all itinerary/leg/waypoint seed data
```

## Notes on Part II content

The "Gates of Enoch," "Archipelago of Thule," "Sea of Hyperborea," "Central Plains of Pan," and "Watchers' Descent" waypoints are invented for this app and are labeled as such both in the seed data (`realm_type = 'speculative'`) and in the UI (drawer disclaimer, dashed cyan route, no-coordinate story cards). Ushuaia, the Drake Passage, and the Ross Ice Shelf are real places used as the fictional departure point for that story thread.
