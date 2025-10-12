'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Memory } from '@/types';
import styles from './MemoryCard.module.css';

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
}

const typeIcons: Record<Memory['type'], string> = {
  place: '📍',
  trip: '✈️',
  journal: '📝',
  photo: '📸',
};

const typeLabels: Record<Memory['type'], string> = {
  place: '장소',
  trip: '여행',
  journal: '일기',
  photo: '사진',
};

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const formattedDate = format(memory.date, 'PPP', { locale: ko });

  return (
    <li className={styles.card} data-component="MemoryCard">
      <button
        className={styles.button}
        onClick={onClick}
        aria-label={`${formattedDate} ${memory.location.name || '위치'} 기억 보기`}
      >
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true">
            {typeIcons[memory.type]}
          </span>
          <div className={styles.meta}>
            <span className={styles.type}>{typeLabels[memory.type]}</span>
            <time className={styles.date} dateTime={memory.date.toISOString()}>
              {formattedDate}
            </time>
          </div>
        </div>

        {memory.location.name && (
          <div className={styles.location}>
            <span className={styles.locationIcon} aria-hidden="true">
              📍
            </span>
            <span className={styles.locationName}>{memory.location.name}</span>
          </div>
        )}

        {memory.preview && (
          <p className={styles.preview}>{memory.preview}</p>
        )}
      </button>
    </li>
  );
}
