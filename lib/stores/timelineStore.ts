/**
 * Timeline state management with Zustand
 */

import { create } from 'zustand';
import type { Memory } from '@/types';

interface TimelineState {
  selectedYear: number;
  yearRange: [number, number];
  memories: Memory[];
  isLoading: boolean;

  // Actions
  setSelectedYear: (year: number) => void;
  setYearRange: (range: [number, number]) => void;
  setMemories: (memories: Memory[]) => void;
  setLoading: (loading: boolean) => void;
  jumpToToday: () => void;
  jumpToYearsAgo: (years: number) => void;
  jumpToRandom: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  selectedYear: new Date().getFullYear(),
  yearRange: [2000, new Date().getFullYear()],
  memories: [],
  isLoading: false,

  setSelectedYear: (year) => set({ selectedYear: year }),
  setYearRange: (range) => set({ yearRange: range }),
  setMemories: (memories) => set({ memories }),
  setLoading: (loading) => set({ isLoading: loading }),

  jumpToToday: () => {
    const currentYear = new Date().getFullYear();
    set({ selectedYear: currentYear });
  },

  jumpToYearsAgo: (years) => {
    const targetYear = new Date().getFullYear() - years;
    const [minYear] = get().yearRange;
    set({ selectedYear: Math.max(targetYear, minYear) });
  },

  jumpToRandom: () => {
    const [minYear, maxYear] = get().yearRange;
    const randomYear =
      Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    set({ selectedYear: randomYear });
  },
}));
