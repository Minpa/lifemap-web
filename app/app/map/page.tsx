'use client';

import { MapCanvas } from '@/components/map/MapCanvas';
import { LayerToggle } from '@/components/map/LayerToggle';
import { Legend } from '@/components/map/Legend';
import { TrackingControls } from '@/components/location/TrackingControls';
import styles from './page.module.css';

export default function MapPage() {
  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <MapCanvas />
        <LayerToggle />
        <Legend />
        <TrackingControls />
      </div>
    </div>
  );
}
