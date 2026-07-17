import { create } from 'zustand';
import type { HighlightColor } from '@/types';

interface HighlightUiState {
  activeColor: HighlightColor;
  selectedHighlightId: string | null;
  noteDraftOpen: boolean;
  setActiveColor: (color: HighlightColor) => void;
  setSelectedHighlightId: (id: string | null) => void;
  setNoteDraftOpen: (open: boolean) => void;
}

export const useHighlightUiStore = create<HighlightUiState>((set) => ({
  activeColor: 'yellow',
  selectedHighlightId: null,
  noteDraftOpen: false,
  setActiveColor: (color) => set({ activeColor: color }),
  setSelectedHighlightId: (id) => set({ selectedHighlightId: id }),
  setNoteDraftOpen: (open) => set({ noteDraftOpen: open }),
}));
