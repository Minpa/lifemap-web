'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Photo } from '@/types';
import styles from './PhotoGrid.module.css';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
  columns?: number;
}

export function PhotoGrid({ photos, onPhotoClick, columns = 4 }: PhotoGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows
  const rows = Math.ceil(photos.length / columns);

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250,
    overscan: 2,
  });

  if (photos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📸</div>
        <h2 className={styles.emptyTitle}>사진이 없습니다</h2>
        <p className={styles.emptyText}>
          사진을 업로드하면 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className={styles.container}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowPhotos = photos.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className={styles.row}>
                {rowPhotos.map((photo, colIndex) => {
                  const photoIndex = startIndex + colIndex;
                  return (
                    <button
                      key={photo.id}
                      onClick={() => onPhotoClick(photo, photoIndex)}
                      className={styles.photoButton}
                      aria-label={`사진 보기: ${photo.filename}`}
                    >
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.caption || photo.filename}
                        className={styles.photo}
                        loading="lazy"
                      />
                      {photo.caption && (
                        <div className={styles.caption}>
                          {photo.caption}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
