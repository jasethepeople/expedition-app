'use client';

import { motion } from 'framer-motion';
import { useExpeditionStore } from '@/lib/store';

/**
 * The page's signature element: a rotating compass rose that flips
 * between a gold "known world" ring and a cyan "beyond the wall" ring —
 * echoing the mercator-vs-azimuthal framing the two itineraries use.
 */
export default function ModeToggle() {
  const mode = useExpeditionStore((s) => s.mode);
  const toggleMode = useExpeditionStore((s) => s.toggleMode);
  const isKnown = mode === 'known';

  return (
    <button
      onClick={toggleMode}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-surface"
      aria-label="Toggle map mode"
    >
      <motion.div
        animate={{ rotate: isKnown ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className={`absolute inset-1 rounded-full border-2 ${isKnown ? 'border-gold' : 'border-polar'}`}
        style={{
          borderStyle: 'solid',
          boxShadow: isKnown ? '0 0 14px rgba(201,162,39,0.35)' : '0 0 14px rgba(79,209,255,0.45)',
        }}
      />
      <span
        className={`relative font-display text-[10px] font-semibold uppercase tracking-wider ${
          isKnown ? 'text-gold' : 'text-polar'
        }`}
      >
        {isKnown ? 'KW' : 'BW'}
      </span>
    </button>
  );
}
