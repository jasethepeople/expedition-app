'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpeditionStore } from '@/lib/store';
import JournalLog from './JournalLog';

const PLACEHOLDER = 'https://placehold.co/640x400/121821/8A94A6?text=No+image+on+file';

export default function WaypointDrawer() {
  const drawerOpen = useExpeditionStore((s) => s.drawerOpen);
  const setDrawerOpen = useExpeditionStore((s) => s.setDrawerOpen);
  const waypoint = useExpeditionStore((s) => s.activeWaypoint);
  const mode = useExpeditionStore((s) => s.mode);
  const [imgIndex, setImgIndex] = useState(0);

  const isKnown = mode === 'known';
  const images = waypoint?.image_urls?.length ? waypoint.image_urls : [PLACEHOLDER];

  const close = () => setDrawerOpen(false);

  return (
    <AnimatePresence>
      {drawerOpen && waypoint && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-[1500] flex h-full w-full max-w-md flex-col border-l border-hairline bg-surface md:max-w-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-hairline p-5">
              <div>
                <div
                  className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
                    isKnown ? 'text-gold' : 'text-polar'
                  }`}
                >
                  <Compass size={12} />
                  {isKnown ? 'Known World' : 'Beyond the Wall — fictional'}
                </div>
                <h2 className="mt-1 font-display text-2xl text-parchment">{waypoint.name}</h2>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted">
                  <MapPin size={12} />
                  {waypoint.latitude != null
                    ? `${waypoint.latitude.toFixed(4)}°, ${waypoint.longitude!.toFixed(4)}°`
                    : waypoint.fictional_coordinates ?? 'coordinates unrecorded'}
                </div>
              </div>
              <button onClick={close} className="rounded-full p-1.5 text-muted hover:bg-surface-raised hover:text-parchment">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Gallery */}
              <div className="relative h-56 w-full bg-void">
                <img src={images[imgIndex]} alt={waypoint.name} className="h-full w-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-parchment"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-parchment"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4 p-5">
                <p className="font-display text-sm leading-relaxed text-parchment/90">
                  {waypoint.description ?? 'No description on file for this waypoint yet.'}
                </p>

                {waypoint.highlights?.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">Highlights</h3>
                    <ul className="space-y-1.5">
                      {waypoint.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-parchment/80">
                          <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${isKnown ? 'bg-gold' : 'bg-polar'}`} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isKnown && (
                  <div className="rounded-md border border-polar/20 bg-polar/5 p-3 text-xs text-polar/80">
                    This location is part of the app's invented "Beyond the Ice Wall" story arc and is not a real,
                    verified place.
                  </div>
                )}
              </div>

              {/* Journal */}
              <div className="border-t border-hairline p-5">
                <JournalLog waypointId={waypoint.id} accent={isKnown ? 'gold' : 'polar'} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
