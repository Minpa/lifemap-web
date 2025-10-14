'use client';

/**
 * Tracking Controls Component
 * 
 * UI controls for starting/stopping location tracking
 */

import { useLocationStore } from '@/lib/stores/locationStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { Play, Square, MapPin, Activity } from 'lucide-react';
import { useEffect } from 'react';
import styles from './TrackingControls.module.css';

export function TrackingControls() {
  const {
    isTracking,
    trackingError,
    todayStats,
    syncStatus,
    startTracking,
    stopTracking,
    refreshTodayStats,
    refreshSyncStatus,
  } = useLocationStore();

  const { user } = useAuthStore();

  // Refresh stats on mount
  useEffect(() => {
    refreshTodayStats();
    refreshSyncStatus();
  }, [refreshTodayStats, refreshSyncStatus]);

  // Handle start/stop tracking
  const handleToggleTracking = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking(user?.id);
    }
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    }
    if (minutes > 0) {
      return `${minutes}분`;
    }
    return `${seconds}초`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>위치 추적</h3>
        <div className={`${styles.status} ${isTracking ? styles.statusActive : styles.statusInactive}`}>
          <Activity className="w-3 h-3" />
          {isTracking ? '추적 중' : '중지됨'}
        </div>
      </div>

      {/* Start/Stop Button */}
      <button
        onClick={handleToggleTracking}
        className={`${styles.button} ${isTracking ? styles.buttonStop : styles.buttonStart}`}
      >
        {isTracking ? (
          <>
            <Square className="w-4 h-4" />
            추적 중지
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            추적 시작
          </>
        )}
      </button>

      {/* Error Message */}
      {trackingError && (
        <div className={styles.error}>
          {trackingError}
        </div>
      )}

      {/* Today's Statistics */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>오늘의 통계</div>
        
        <div className={styles.stats}>
          {/* Points Count */}
          <div className={styles.statRow}>
            <div className={styles.statLabel}>
              <MapPin className="w-4 h-4" />
              <span>기록된 위치</span>
            </div>
            <span className={styles.statValue}>
              {todayStats.pointsCount}개
            </span>
          </div>

          {/* Distance */}
          <div className={styles.statRow}>
            <span className={styles.statLabel}>이동 거리</span>
            <span className={styles.statValue}>
              {formatDistance(todayStats.distance)}
            </span>
          </div>

          {/* Duration */}
          <div className={styles.statRow}>
            <span className={styles.statLabel}>추적 시간</span>
            <span className={styles.statValue}>
              {formatDuration(todayStats.duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className={styles.section}>
        <div className={styles.syncStatus}>
          <span className={styles.syncLabel}>동기화 상태</span>
          <div className={styles.syncValue}>
            {syncStatus.isSyncing ? (
              <span className={styles.syncSyncing}>동기화 중...</span>
            ) : syncStatus.unsyncedCount > 0 ? (
              <span className={styles.syncPending}>
                {syncStatus.unsyncedCount}개 대기 중
              </span>
            ) : (
              <span className={styles.syncComplete}>동기화 완료</span>
            )}
          </div>
        </div>
        
        {syncStatus.lastSyncTime && (
          <div className={styles.syncTime}>
            마지막 동기화: {new Date(syncStatus.lastSyncTime).toLocaleTimeString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  );
}
