'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';

/**
 * Client component that applies palette colors to DOM on mount
 * Should be included in root layout
 */
export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const { applyPaletteToDOM } = usePreferencesStore();

  useEffect(() => {
    // Apply palette colors to CSS variables on mount
    applyPaletteToDOM();
  }, [applyPaletteToDOM]);

  return <>{children}</>;
}
