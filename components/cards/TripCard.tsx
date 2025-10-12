'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Trip } from '@/types';
import styles from './TripCard.module.css';

interface TripCardProps {
  trip: Trip;
  onMerge?: (tripId: string) => void;
  onEdit?: (tripId: string) => void;
  onShare?: (tripId: string) => void;
}

export function TripCard({ trip, onMerge, onEdit, onShare }: TripCardProps) {
  const startDate = format(trip.startDate, 'PPP', { locale: ko });
  const endDate = format(trip.endDate, 'PPP', { locale: ko });

  return (
    <section className={styles.card} data-component="TripCard">
      <header className={styles.header}>
        <h3 className={styles.title}>{trip.name}</h3>
        <div className={styles.dateRange}>
          <time dateTime={trip.startDate.toISOString()}>{startDate}</time>
          <span className={styles.dateSeparator}>–</span>
          <time dateTime={trip.endDate.toISOString()}>{endDate}</time>
        </div>
        {trip.isAutoDetected && (
          <span className={styles.badge}>자동 감지</span>
        )}
      </header>

      {trip.photos.length > 0 && (
        <div className={styles.gallery} aria-label="여행 사진">
          <div className={styles.galleryPlaceholder}>
            <span className={styles.photoIcon}>📸</span>
            <span className={styles.photoCount}>{trip.photos.length}장</span>
          </div>
        </div>
      )}

      {trip.notes && (
        <p className={styles.notes}>"{trip.notes}"</p>
      )}

      <div className={styles.actions}>
        {onMerge && (
          <button
            onClick={() => onMerge(trip.id)}
            className={styles.actionButton}
            data-action="merge"
          >
            여행 합치기
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(trip.id)}
            className={styles.actionButton}
            data-action="edit"
          >
            메모
          </button>
        )}
        {onShare && (
          <button
            onClick={() => onShare(trip.id)}
            className={`${styles.actionButton} ${styles.primary}`}
            data-action="share"
          >
            공유
          </button>
        )}
      </div>
    </section>
  );
}
