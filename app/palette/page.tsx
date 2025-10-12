'use client';

import { useEffect } from 'react';
import { PalettePanel } from '@/components/palette/PalettePanel';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import styles from './page.module.css';

export default function PalettePage() {
  const { applyPaletteToDOM } = usePreferencesStore();

  // Apply palette on mount
  useEffect(() => {
    applyPaletteToDOM();
  }, [applyPaletteToDOM]);

  return (
    <div className={styles.container}>
      <PalettePanel />
    </div>
  );
}
