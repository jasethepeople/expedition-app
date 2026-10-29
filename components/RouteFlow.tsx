'use client';

import { motion } from 'framer-motion';
import { useExpeditionStore } from '@/lib/store';
import type { ItineraryWithLegs } from '@/types/database';

interface RouteFlowProps {
  itineraries: ItineraryWithLegs[];
}

/**
 * Horizontal node-and-connector diagram of the active itinerary's legs.
 * Clicking a node focuses the map on that leg's first waypoint and
 * opens the waypoint drawer.
 */
export default function RouteFlow({ itineraries }: RouteFlowProps) {
  const mode = useExpeditionStore((s) => s.mode);
  const focusedLegId = useExpeditionStore((s) => s.focusedLegId);
  const setFocusedLegId = useExpeditionStore((s) => s.setFocusedLegId);
  const setActiveWaypoint = useExpeditionStore((s) => s.setActiveWaypoint);

  const itinerary = itineraries.find((i) => i.realm_type === mode);
  if (!itinerary) return null;

  const isKnown = mode === 'known';

  const handleSelect = (legId: string) => {
    setFocusedLegId(legId);
    const leg = itinerary.legs.find((l) => l.id === legId);
    if (leg?.waypoints[0]) setActiveWaypoint(leg.waypoints[0]);
  };

  return (
    <div className="flex items-center gap-0 overflow-x-auto px-6 py-4 font-mono text-xs">
      {itinerary.legs.map((leg, i) => {
        const isFocused = focusedLegId === leg.id;
        return (
          <div key={leg.id} className="flex shrink-0 items-center">
            <motion.button
              onClick={() => handleSelect(leg.id)}
              whileHover={{ y: -2 }}
              className={`group flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                isFocused
                  ? isKnown
                    ? 'border-gold bg-gold/10'
                    : 'border-polar bg-polar/10'
                  : 'border-hairline bg-surface hover:border-muted'
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-widest ${
                  isFocused ? (isKnown ? 'text-gold' : 'text-polar') : 'text-muted'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="max-w-[180px] font-sans text-sm normal-case text-parchment">
                {leg.title.replace(/^(Leg \d+: |Phase \d+: )/, '')}
              </span>
              <span className="text-muted">{leg.waypoints.length} waypoints</span>
            </motion.button>

            {i < itinerary.legs.length - 1 && (
              <div className={`mx-1 h-px w-8 ${mode === 'known' ? 'bg-gold-dim' : 'bg-polar-dim'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
