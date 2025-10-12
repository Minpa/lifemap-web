/**
 * Journal state management with Zustand
 */

import { create } from 'zustand';
import type { JournalEntry } from '@/types';

interface JournalState {
  currentEntry: JournalEntry | null;
  entries: JournalEntry[];
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  setCurrentEntry: (entry: JournalEntry | null) => void;
  setEntries: (entries: JournalEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  updateLastSaved: () => void;
  updateEntryContent: (content: string) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  currentEntry: null,
  entries: [],
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  setCurrentEntry: (entry) => set({ currentEntry: entry }),
  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  updateLastSaved: () => set({ lastSaved: new Date() }),

  updateEntryContent: (content) => {
    const { currentEntry } = get();
    if (currentEntry) {
      set({
        currentEntry: {
          ...currentEntry,
          content,
          updatedAt: new Date(),
        },
      });
    }
  },
}));
