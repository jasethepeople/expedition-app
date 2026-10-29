-- ============================================================================
-- Master World Tour & Expedition Beyond the Ice Wall — Schema
-- ============================================================================
create extension if not exists "uuid-ossp";

create type realm_type as enum ('known', 'speculative');

-- ----------------------------------------------------------------------------
-- itineraries: top-level container (Part I / Part II)
-- ----------------------------------------------------------------------------
create table itineraries (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,               -- 'known-world' | 'beyond-the-ice-wall'
  title text not null,
  subtitle text,
  realm_type realm_type not null,
  hero_description text,
  sequence_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- legs: sections/phases within an itinerary
-- ----------------------------------------------------------------------------
create table legs (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references itineraries(id) on delete cascade,
  title text not null,                     -- e.g. "Leg 1: The Americas"
  description text,
  sequence_order int not null default 0,
  realm_type realm_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_legs_itinerary on legs(itinerary_id);

-- ----------------------------------------------------------------------------
-- waypoints: individual stops
-- ----------------------------------------------------------------------------
create table waypoints (
  id uuid primary key default uuid_generate_v4(),
  leg_id uuid not null references legs(id) on delete cascade,
  name text not null,
  latitude double precision,               -- nullable: speculative waypoints may lack real coords
  longitude double precision,
  fictional_coordinates text,              -- e.g. "84°S beyond charted ice" for speculative sites
  description text,
  highlights text[] default '{}',
  image_urls text[] default '{}',
  custom_map_icon text,                    -- lucide icon name or storage path
  sequence_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_waypoints_leg on waypoints(leg_id);

-- ----------------------------------------------------------------------------
-- journal_entries: user logs per waypoint
-- ----------------------------------------------------------------------------
create table journal_entries (
  id uuid primary key default uuid_generate_v4(),
  waypoint_id uuid not null references waypoints(id) on delete cascade,
  author text,                             -- display name / anon id
  notes text not null,
  media_urls text[] default '{}',
  created_at timestamptz not null default now()
);
create index idx_journal_waypoint on journal_entries(waypoint_id);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table itineraries enable row level security;
alter table legs enable row level security;
alter table waypoints enable row level security;
alter table journal_entries enable row level security;

create policy "public read itineraries" on itineraries for select using (true);
create policy "public read legs" on legs for select using (true);
create policy "public read waypoints" on waypoints for select using (true);

create policy "public read journal" on journal_entries for select using (true);
create policy "public insert journal" on journal_entries for insert with check (true);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_itineraries_updated before update on itineraries
  for each row execute function set_updated_at();
create trigger trg_legs_updated before update on legs
  for each row execute function set_updated_at();
create trigger trg_waypoints_updated before update on waypoints
  for each row execute function set_updated_at();
