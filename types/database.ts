export type RealmType = 'known' | 'speculative';

export interface Itinerary {
  id: string;
  slug: 'known-world' | 'beyond-the-ice-wall';
  title: string;
  subtitle: string | null;
  realm_type: RealmType;
  hero_description: string | null;
  sequence_order: number;
}

export interface Leg {
  id: string;
  itinerary_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  realm_type: RealmType;
}

export interface Waypoint {
  id: string;
  leg_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  fictional_coordinates: string | null;
  description: string | null;
  highlights: string[];
  image_urls: string[];
  custom_map_icon: string | null;
  sequence_order: number;
}

export interface JournalEntry {
  id: string;
  waypoint_id: string;
  author: string | null;
  notes: string;
  media_urls: string[];
  created_at: string;
}

// Convenience nested shape used by the client after a joined fetch
export interface LegWithWaypoints extends Leg {
  waypoints: Waypoint[];
}

export interface ItineraryWithLegs extends Itinerary {
  legs: LegWithWaypoints[];
}

// Row/Insert/Update shapes, used directly at each Supabase call site
// rather than fed through createClient<Database>() — see lib/supabase.ts
// for why. Kept here so the shapes still live in one typed place.
export interface JournalEntryInsert {
  waypoint_id: string;
  notes: string;
  author?: string | null;
  media_urls?: string[];
}
