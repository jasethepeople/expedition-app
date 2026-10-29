import { create } from 'zustand';
import type { RealmType, Waypoint } from '@/types/database';

interface ExpeditionState {
  mode: RealmType;
  setMode: (mode: RealmType) => void;
  toggleMode: () => void;

  activeWaypoint: Waypoint | null;
  setActiveWaypoint: (w: Waypoint | null) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  focusedLegId: string | null;
  setFocusedLegId: (id: string | null) => void;
}

export const useExpeditionStore = create<ExpeditionState>((set, get) => ({
  mode: 'known',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set({ mode: get().mode === 'known' ? 'speculative' : 'known' }),

  activeWaypoint: null,
  setActiveWaypoint: (w) => set({ activeWaypoint: w, drawerOpen: !!w }),

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  focusedLegId: null,
  setFocusedLegId: (id) => set({ focusedLegId: id }),
}));
