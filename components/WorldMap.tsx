'use client';

import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { useExpeditionStore } from '@/lib/store';
import type { ItineraryWithLegs, Waypoint } from '@/types/database';

interface WorldMapProps {
  itineraries: ItineraryWithLegs[];
}

const knownIcon = L.divIcon({
  className: '',
  html: `<div class="h-3 w-3 rounded-full bg-gold ring-4 ring-gold/20"></div>`,
  iconSize: [12, 12],
});

const polarIcon = L.divIcon({
  className: '',
  html: `<div class="h-3 w-3 rounded-full bg-polar ring-4 ring-polar/20 shadow-[0_0_12px_2px_rgba(79,209,255,0.6)]"></div>`,
  iconSize: [12, 12],
});

/** Recenters the map whenever the active waypoint changes. */
function CameraRig({ target }: { target: [number, number] | null }) {
  const map = useMap();
  if (target) {
    map.flyTo(target, 6, { duration: 1.2 });
  }
  return null;
}

export default function WorldMap({ itineraries }: WorldMapProps) {
  const mode = useExpeditionStore((s) => s.mode);
  const setActiveWaypoint = useExpeditionStore((s) => s.setActiveWaypoint);
  const activeWaypoint = useExpeditionStore((s) => s.activeWaypoint);

  const itinerary = itineraries.find((i) => i.realm_type === mode);

  const routedWaypoints: Waypoint[] = useMemo(() => {
    if (!itinerary) return [];
    return itinerary.legs
      .flatMap((leg) => leg.waypoints)
      .filter((w) => w.latitude !== null && w.longitude !== null);
  }, [itinerary]);

  const polyline: [number, number][] = routedWaypoints.map((w) => [w.latitude!, w.longitude!]);
  const cameraTarget: [number, number] | null =
    activeWaypoint?.latitude != null && activeWaypoint?.longitude != null
      ? [activeWaypoint.latitude, activeWaypoint.longitude]
      : null;

  const center: [number, number] = mode === 'known' ? [20, 20] : [-70, -40];
  const zoom = mode === 'known' ? 2 : 3;
  const tileUrl =
    mode === 'known'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="h-full w-full"
        >
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full bg-void"
            worldCopyJump
            zoomControl={false}
          >
            <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap &copy; CARTO" />
            <CameraRig target={cameraTarget} />

            <Polyline
              positions={polyline}
              pathOptions={{
                color: mode === 'known' ? '#C9A227' : '#4FD1FF',
                weight: 2,
                opacity: 0.7,
                dashArray: mode === 'speculative' ? '4 6' : undefined,
              }}
            />

            {routedWaypoints.map((w) => (
              <Marker
                key={w.id}
                position={[w.latitude!, w.longitude!]}
                icon={mode === 'known' ? knownIcon : polarIcon}
                eventHandlers={{ click: () => setActiveWaypoint(w) }}
              />
            ))}
          </MapContainer>
        </motion.div>
      </AnimatePresence>

      {/* Mode label overlay */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] font-mono text-xs uppercase tracking-widest text-muted">
        <span className={mode === 'known' ? 'text-gold' : 'text-polar'}>
          {mode === 'known' ? 'Known World — Mercator' : 'Beyond the Wall — Fictional Overlay'}
        </span>
      </div>

      {/* Non-routed (fictional, no-coordinate) waypoints, listed for speculative mode */}
      {mode === 'speculative' && itinerary && (
        <FictionalWaypointRail itinerary={itinerary} />
      )}
    </div>
  );
}

function FictionalWaypointRail({ itinerary }: { itinerary: ItineraryWithLegs }) {
  const setActiveWaypoint = useExpeditionStore((s) => s.setActiveWaypoint);
  const unrouted = itinerary.legs
    .flatMap((l) => l.waypoints)
    .filter((w) => w.latitude === null);

  if (unrouted.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto">
      {unrouted.map((w) => (
        <button
          key={w.id}
          onClick={() => setActiveWaypoint(w)}
          className="whitespace-nowrap rounded-full border border-polar/30 bg-surface/80 px-3 py-1.5 font-mono text-xs text-polar backdrop-blur hover:bg-polar/10"
        >
          {w.name}
        </button>
      ))}
    </div>
  );
}
