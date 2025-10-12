'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { RunSession } from '@/types';
import styles from './RunCard.module.css';

interface RunCardProps {
  run: RunSession;
  onExportGPX?: (runId: string) => void;
  onShare?: (runId: string) => void;
}

export function RunCard({ run, onExportGPX, onShare }: RunCardProps) {
  const formatPace = (secondsPerKm: number): string => {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.floor(secondsPerKm % 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(2)}km`;
  };

  const dateTime = format(run.startTime, 'PPP HH:mm', { locale: ko });

  return (
    <section className={styles.card} data-component="RunCard">
      <header className={styles.header}>
        <h3 className={styles.title}>{run.name}</h3>
        <div className={styles.dateTime}>
          <time dateTime={run.startTime.toISOString()}>{dateTime}</time>
        </div>
      </header>

      <ul className={styles.metrics}>
        <li className={styles.metric}>
          <span className={styles.metricIcon}>📏</span>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>거리</span>
            <strong className={styles.metricValue}>
              {formatDistance(run.distance)}
            </strong>
          </div>
        </li>
        <li className={styles.metric}>
          <span className={styles.metricIcon}>⏱️</span>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>평균 페이스</span>
            <strong className={styles.metricValue}>
              {formatPace(run.averagePace)}
            </strong>
          </div>
        </li>
        <li className={styles.metric}>
          <span className={styles.metricIcon}>⛰️</span>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>고도 상승</span>
            <strong className={styles.metricValue}>{run.elevationGain}m</strong>
          </div>
        </li>
      </ul>

      {run.privacyMasked && (
        <div className={styles.privacyHint}>
          출발/도착 500m 마스킹
        </div>
      )}

      <div className={styles.actions}>
        {onExportGPX && (
          <button
            onClick={() => onExportGPX(run.id)}
            className={styles.actionButton}
            data-action="export-gpx"
          >
            GPX 내보내기
          </button>
        )}
        {onShare && (
          <button
            onClick={() => onShare(run.id)}
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
