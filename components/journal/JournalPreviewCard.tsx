'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { JournalEntry } from '@/types';
import styles from './JournalPreviewCard.module.css';

interface JournalPreviewCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  calm: '😌',
  anxious: '😰',
  grateful: '🙏',
  reflective: '🤔',
};

export function JournalPreviewCard({ entry, onClick }: JournalPreviewCardProps) {
  const formattedDate = format(new Date(entry.date), 'PPP', { locale: ko });
  const dayOfWeek = format(new Date(entry.date), 'EEEE', { locale: ko });

  // Extract first 150 characters for preview
  const preview = entry.content.slice(0, 150) + (entry.content.length > 150 ? '...' : '');

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.dateInfo}>
          <time className={styles.date} dateTime={entry.date}>
            {formattedDate}
          </time>
          <span className={styles.dayOfWeek}>{dayOfWeek}</span>
        </div>
        <div className={styles.meta}>
          {entry.weather && (
            <span className={styles.weather} aria-label="날씨">
              {entry.weather.icon}
            </span>
          )}
          {entry.mood && (
            <span className={styles.mood} aria-label={`기분: ${entry.mood}`}>
              {moodEmojis[entry.mood]}
            </span>
          )}
        </div>
      </div>

      {entry.timeline.length > 0 && entry.timeline[0].place && (
        <div className={styles.location}>
          <span className={styles.locationIcon} aria-hidden="true">
            📍
          </span>
          <span className={styles.locationName}>
            {entry.timeline[0].place.name}
          </span>
        </div>
      )}

      {preview && (
        <p className={styles.preview}>{preview}</p>
      )}

      {entry.photos.length > 0 && (
        <div className={styles.photoCount}>
          <span aria-hidden="true">📸</span>
          <span>{entry.photos.length}장</span>
        </div>
      )}
    </article>
  );
}
