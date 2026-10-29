/**
 * Pulls a representative photo for a real-world waypoint from Wikipedia's
 * public REST summary API. Only used for `known` waypoints — the invented
 * "Beyond the Ice Wall" locations intentionally keep the "no image on file"
 * placeholder rather than borrow a real photo for a fictional place.
 *
 * Not license-tracked per-image: swap in Supabase Storage + your own
 * licensed/uploaded photos for production use. This is a reasonable
 * default for local development and demos.
 */

const cache = new Map<string, string | null>();

export async function getWikiThumbnail(title: string): Promise<string | null> {
  if (cache.has(title)) return cache.get(title)!;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 60 * 60 * 24 * 7 } } // cache 7 days
    );
    if (!res.ok) throw new Error(`Wikipedia summary failed: ${res.status}`);
    const json = await res.json();
    const url: string | null = json?.thumbnail?.source ?? json?.originalimage?.source ?? null;
    cache.set(title, url);
    return url;
  } catch {
    cache.set(title, null);
    return null;
  }
}

/** Best-effort title cleanup — strips parenthetical/slash suffixes common in this itinerary's waypoint names. */
export function toWikiTitle(waypointName: string): string {
  return waypointName.split(/[/(]/)[0].trim();
}
