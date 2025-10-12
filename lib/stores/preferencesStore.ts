/**
 * User preferences state management with Zustand
 * Persisted to localStorage and IndexedDB
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, PaletteColors } from '@/types';

interface PreferencesState extends Omit<UserPreferences, 'userId'> {
  // Actions
  setPalette: (palette: PaletteColors) => void;
  setPaletteColor: (slot: keyof PaletteColors, color: string) => void;
  setThicknessScale: (scale: number) => void;
  setGlowIntensity: (intensity: number) => void;
  setLanguage: (language: 'ko' | 'en' | 'ja') => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  setJournalReminder: (enabled: boolean, time?: string) => void;
  applyPaletteToDOM: () => void;
}

const defaultPalette: PaletteColors = {
  palette0: '#7fe3ff',
  palette1: '#8af5c2',
  palette2: '#ffd166',
  palette3: '#ff7aa2',
  palette4: '#9d8cff',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      palette: defaultPalette,
      thicknessScale: 50,
      glowIntensity: 50,
      language: 'ko',
      units: 'metric',
      journalReminder: undefined,

      setPalette: (palette) => {
        set({ palette });
        get().applyPaletteToDOM();
      },

      setPaletteColor: (slot, color) => {
        const palette = { ...get().palette, [slot]: color };
        set({ palette });
        get().applyPaletteToDOM();
      },

      setThicknessScale: (scale) => set({ thicknessScale: scale }),
      setGlowIntensity: (intensity) => set({ glowIntensity: intensity }),
      setLanguage: (language) => set({ language }),
      setUnits: (units) => set({ units }),

      setJournalReminder: (enabled, time) => {
        if (enabled && time) {
          set({ journalReminder: { enabled, time } });
        } else {
          set({ journalReminder: { enabled: false, time: '20:00' } });
        }
      },

      applyPaletteToDOM: () => {
        const { palette } = get();
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.style.setProperty('--palette-0', palette.palette0);
          root.style.setProperty('--palette-1', palette.palette1);
          root.style.setProperty('--palette-2', palette.palette2);
          root.style.setProperty('--palette-3', palette.palette3);
          root.style.setProperty('--palette-4', palette.palette4);
        }
      },
    }),
    {
      name: 'lifemap-preferences',
    }
  )
);
