'use client';

import { useMapStore } from '@/lib/stores/mapStore';
import styles from './LayerToggle.module.css';

const layerLabels: Record<string, string> = {
  track: '궤적',
  heat: '누적 영역',
  rings: '대표 위치 링',
  resonance: '공명 지도',
  runs: '러닝',
};

export function LayerToggle() {
  const { layers, toggleLayer } = useMapStore();

  return (
    <div className={styles.container} role="group" aria-label="레이어">
      <h3 className={styles.title}>레이어</h3>
      <div className={styles.controls}>
        {layers.map((layer) => (
          <label key={layer.id} className={styles.label}>
            <input
              type="checkbox"
              checked={layer.enabled}
              onChange={() => toggleLayer(layer.id)}
              className={styles.checkbox}
              aria-label={`${layerLabels[layer.id]} 레이어 토글`}
            />
            <span className={styles.labelText}>{layerLabels[layer.id]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
