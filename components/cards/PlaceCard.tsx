'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Place } from '@/types';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  place: Place;
  onFavoriteToggle?: (placeId: string) => void;
  onShare?: (placeId: string) => void;
}

const categoryLabels: Record<Place['category'], string> = {
  home: '집',
  work: '직장',
  frequent: '자주 가는 곳',
  other: '기타',
};

export function PlaceCard({
  place,
  onFavoriteToggle,
  onShare,
}: PlaceCardProps) {
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(ms / (1000 * 60));
      return `${minutes}분`;
    }
    return `${hours}시간`;
  };

  const monthHours = formatDuration(place.totalDuration * 0.1); // Mock data
  const yearHours = formatDuration(place.totalDuration * 0.5);
  const lifetimeHours = formatDuration(place.totalDuration);

  return (
    <section
      className={styles.card}
      data-component="PlaceCard"
      aria-labelledby="place-title"
    >
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 id="place-title" className={styles.title}>
            {place.name}
          </h3>
          <button
            onClick={() => onFavoriteToggle?.(place.id)}
            className={styles.favoriteButton}
            aria-pressed={place.isFavorite}
            aria-label="즐겨찾기"
          >
            {place.isFavorite ? '★' : '☆'}
          </button>
        </div>
        <div className={styles.badge}>{categoryLabels[place.category]}</div>
      </header>

      <div className={styles.stats}>
        <div className={styles.visualizations}>
          <div
            className={styles.lifeClock}
            role="img"
            aria-label="시간대별 체류 도넛 차트"
          >
            <div className={styles.lifeClockPlaceholder}>🕐</div>
            <span className={styles.lifeClockLabel}>시간대별 분포</span>
          </div>
          <div
            className={styles.weekHeatmap}
            role="img"
            aria-label="요일×시간 히트맵"
          >
            <div className={styles.heatmapPlaceholder}>📊</div>
            <span className={styles.heatmapLabel}>주간 패턴</span>
          </div>
        </div>
      </div>

      <ul className={styles.summary} role="list">
        <li className={styles.summaryItem}>
          <span className={styles.summaryLabel}>이번달</span>
          <strong className={styles.summaryValue} data-prop="month_hours">
            {monthHours}
          </strong>
        </li>
        <li className={styles.summaryItem}>
          <span className={styles.summaryLabel}>올해</span>
          <strong className={styles.summaryValue} data-prop="year_hours">
            {yearHours}
          </strong>
        </li>
        <li className={styles.summaryItem}>
          <span className={styles.summaryLabel}>평생</span>
          <strong className={styles.summaryValue} data-prop="lifetime_hours">
            {lifetimeHours}
          </strong>
        </li>
      </ul>

      <footer className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            최근 방문:{' '}
            <time data-prop="last_visit" dateTime={place.lastVisit.toISOString()}>
              {format(place.lastVisit, 'PPP', { locale: ko })}
            </time>
          </span>
          {place.privacyMasked && (
            <span className={styles.privacy}>좌표 마스킹 ON</span>
          )}
        </div>
        {onShare && (
          <button
            onClick={() => onShare(place.id)}
            className={styles.shareButton}
          >
            공유
          </button>
        )}
      </footer>
    </section>
  );
}
