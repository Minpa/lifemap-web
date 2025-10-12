'use client';

import type { Photo } from '@/types';
import styles from './PhotoMarker.module.css';

interface PhotoMarkerProps {
  photo: Photo;
  onClick: () => void;
  isSelected?: boolean;
}

export function PhotoMarker({ photo, onClick, isSelected }: PhotoMarkerProps) {
  return (
    <button
      className={`${styles.marker} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      aria-label={`사진: ${photo.filename}`}
      style={{
        backgroundImage: `url(${photo.thumbnailUrl})`,
      }}
    >
      <span className={styles.icon} aria-hidden="true">
        📸
      </span>
    </button>
  );
}
