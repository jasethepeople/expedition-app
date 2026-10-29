import dynamic from 'next/dynamic';
import RouteFlow from '@/components/RouteFlow';
import WaypointDrawer from '@/components/WaypointDrawer';
import ModeToggle from '@/components/ModeToggle';
import { getItineraries } from '@/lib/itinerary-data';

// react-leaflet touches window at import time, so the map must be client-only.
const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false });

export default async function Page() {
  const itineraries = await getItineraries();

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-void text-parchment">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <div>
          <h1 className="font-display text-xl tracking-wide">
            Master World Tour <span className="text-muted">&amp;</span> Expedition Beyond the Ice Wall
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Two itineraries. One known, one invented.
          </p>
        </div>
        <ModeToggle />
      </header>

      {/* Map */}
      <div className="relative flex-1">
        <WorldMap itineraries={itineraries} />
      </div>

      {/* Route flow / node timeline */}
      <footer className="border-t border-hairline bg-surface/60">
        <RouteFlow itineraries={itineraries} />
      </footer>

      <WaypointDrawer />
    </main>
  );
}
