import { supabase } from './supabase';
import { getWikiThumbnail, toWikiTitle } from './wiki-images';
import type { ItineraryWithLegs, LegWithWaypoints, Waypoint } from '@/types/database';

/**
 * Client-side fallback so the UI still renders in a sandbox/demo
 * without a live Supabase project configured. Mirrors supabase/seed.sql.
 * Part II entries are explicitly fictional narrative content, not real places.
 */
export const FALLBACK_DATA: ItineraryWithLegs[] = [
  {
    id: 'known-world',
    slug: 'known-world',
    title: 'The Known World Tour',
    subtitle: 'Seven legs, one continuous circuit',
    realm_type: 'known',
    hero_description: 'A circumnavigation departing Willard, Utah.',
    sequence_order: 1,
    legs: [
      leg('Leg 1: The Americas, Aztec Sites & Olmec Heads', 'known', [
        wp('Mexico City', 19.4326, -99.1332, ['Templo Mayor', 'Teotihuacan pyramids']),
        wp('Villahermosa', 17.9895, -92.9475, ['Olmec colossal heads']),
        wp('Venezuela — Cerro Autana / Auyán-tepui', 5.95, -67.45, ['Cerro Autana', 'Angel Falls']),
        wp('Cusco & Machu Picchu', -13.1631, -72.545, ['Machu Picchu', 'Sacsayhuamán']),
        wp('Salar de Uyuni', -20.1338, -67.4891, ['Mirror salt flats']),
        wp('Easter Island / Rapa Nui', -27.1127, -109.3497, ['Moai', 'Rano Raraku quarry']),
      ]),
      leg('Leg 2: Oceania & Southeast Asia', 'known', [
        wp('Auckland', -36.8485, 174.7633, ['Sky Tower']),
        wp('Sydney', -33.8688, 151.2093, ['Opera House', 'Harbour Bridge']),
        wp('Melbourne', -37.8136, 144.9631, ['Laneways']),
        wp('Singapore', 1.3521, 103.8198, ['Gardens by the Bay']),
        wp('Bangkok', 13.7563, 100.5018, ['Wat Arun', 'Grand Palace']),
      ]),
      leg('Leg 3: Middle East & Scripture Sites', 'known', [
        wp('Dubai', 25.2048, 55.2708, ['Burj Khalifa']),
        wp('Tabuk / Jabal al-Lawz', 28.66, 35.3, ['Split Rock of Horeb']),
        wp('Cairo / Giza', 29.9773, 31.1325, ['Great Pyramid', 'Sphinx']),
        wp('Baalbek', 34.0059, 36.2039, ['Baalbek trilithon', 'Cedars of God']),
      ]),
      leg('Leg 4: Russia & Siberian Megaliths', 'known', [
        wp('Moscow', 55.7558, 37.6173, ['Red Square', 'Kremlin']),
        wp('Baksan Valley / Mount Elbrus', 43.3499, 42.4453, ['Mount Elbrus']),
        wp('Shoria Mountains / Novokuznetsk', 53.7557, 87.1099, ['Mountain Shoria megaliths']),
      ]),
      leg('Leg 5: Eastern Turkey & Reverse Orient Express', 'known', [
        wp('Göbeklitepe', 37.2231, 38.9224, ['Enclosure D']),
        wp('Mount Ararat', 39.7019, 44.2983, ['Ararat summit views']),
        wp('Derinkuyu', 38.3728, 34.735, ['8 subterranean levels']),
        wp('Istanbul → Sofia → Bucharest → Budapest → Vienna', 41.0082, 28.9784, ['Sirkeci Terminal']),
      ]),
      leg('Leg 6: The Alps, Spain, Italy & Monaco', 'known', [
        wp('Zermatt / Matterhorn', 46.0207, 7.7491, ['Matterhorn views']),
        wp('Camino de Santiago', 42.8805, -8.5456, ['Santiago de Compostela cathedral']),
        wp('Rome', 41.9028, 12.4964, ['Colosseum', 'Vatican']),
        wp('Monte-Carlo', 43.7384, 7.4246, ['Casino de Monte-Carlo']),
      ]),
      leg('Leg 7: Scotland & Ireland', 'known', [
        wp('Scottish Highlands', 57.0, -4.5, ['Loch Ness', 'Isle of Skye']),
        wp("Giant's Causeway", 55.2408, -6.5116, ['Hexagonal basalt columns']),
      ]),
    ],
  },
  {
    id: 'beyond-the-ice-wall',
    slug: 'beyond-the-ice-wall',
    title: 'Expedition Beyond the Ice Wall',
    subtitle: 'A fictional, speculative continuation',
    realm_type: 'speculative',
    hero_description:
      'An invented story extension of the tour, staged beyond the southern edge of the charted world. Presented as fiction, not fact.',
    sequence_order: 2,
    legs: [
      leg('Phase 1: Crossing the Known Barrier', 'speculative', [
        wp('Ushuaia', -54.8019, -68.303, ['End of the world port']),
        wp('Drake Passage', -60, -65, ['Open-ocean crossing']),
        wp('Ross Ice Shelf / "Point of Finé"', -79.5, -175, ['Fictional narrative marker']),
      ]),
      leg('Phase 2: Breaching the Gates of Enoch & Outer Realm', 'speculative', [
        wp('The Gates of Enoch', null, null, ['Invented story waypoint']),
        wp('Archipelago of Thule', null, null, ['Invented story waypoint']),
        wp('The Sea of Hyperborea', null, null, ['Invented story waypoint']),
      ]),
      leg('Phase 3: Central Plains of Pan & Watchers\u2019 Descent', 'speculative', [
        wp('Central Plains of Pan', null, null, ['Invented story waypoint']),
        wp("The Watchers' Descent", null, null, ['Invented story waypoint']),
      ]),
    ],
  },
];

function wp(name: string, lat: number | null, lng: number | null, highlights: string[]): Waypoint {
  return {
    id: slugify(name),
    leg_id: '',
    name,
    latitude: lat,
    longitude: lng,
    fictional_coordinates: lat === null ? 'invented — no real coordinates' : null,
    description: null,
    highlights,
    image_urls: [],
    custom_map_icon: null,
    sequence_order: 0,
  };
}

function leg(title: string, realm_type: 'known' | 'speculative', waypoints: Waypoint[]): LegWithWaypoints {
  const id = slugify(title);
  return {
    id,
    itinerary_id: '',
    title,
    description: null,
    sequence_order: 0,
    realm_type,
    waypoints: waypoints.map((w) => ({ ...w, leg_id: id })),
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Fetches the full itinerary tree from Supabase, falling back to bundled
 * demo data if no Supabase project is configured or the request fails.
 * Real (`known`) waypoints without a stored image are enriched with a
 * Wikipedia thumbnail; fictional Part II waypoints are left untouched.
 */
export async function getItineraries(): Promise<ItineraryWithLegs[]> {
  const base = await fetchBase();
  return enrichWithPhotos(base);
}

async function fetchBase(): Promise<ItineraryWithLegs[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return FALLBACK_DATA;

  try {
    const { data: itineraries, error } = await supabase
      .from('itineraries')
      .select('*, legs(*, waypoints(*))')
      .order('sequence_order');

    if (error || !itineraries) throw error ?? new Error('No data');
    return itineraries as ItineraryWithLegs[];
  } catch {
    return FALLBACK_DATA;
  }
}

async function enrichWithPhotos(itineraries: ItineraryWithLegs[]): Promise<ItineraryWithLegs[]> {
  return Promise.all(
    itineraries.map(async (itinerary) => ({
      ...itinerary,
      legs: await Promise.all(
        itinerary.legs.map(async (leg) => ({
          ...leg,
          waypoints: await Promise.all(
            leg.waypoints.map(async (w) => {
              if (w.image_urls?.length || itinerary.realm_type !== 'known') return w;
              const photo = await getWikiThumbnail(toWikiTitle(w.name));
              return photo ? { ...w, image_urls: [photo] } : w;
            })
          ),
        }))
      ),
    }))
  );
}
