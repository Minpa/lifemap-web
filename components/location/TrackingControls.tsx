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
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">위치 추적</h3>
        <div className={`flex items-center gap-1 text-xs ${
          isTracking ? 'text-green-600' : 'text-gray-400'
        }`}>
          <Activity className="w-3 h-3" />
          {isTracking ? '추적 중' : '중지됨'}
        </div>
      </div>

      {/* Start/Stop Button */}
      <button
        onClick={handleToggleTracking}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          isTracking
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
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
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {trackingError}
        </div>
      )}

      {/* Today's Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-500 mb-2">오늘의 통계</div>
        
        <div className="space-y-2">
          {/* Points Count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>기록된 위치</span>
            </div>
            <span className="font-medium text-gray-900">
              {todayStats.pointsCount}개
            </span>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">이동 거리</span>
            <span className="font-medium text-gray-900">
              {formatDistance(todayStats.distance)}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">추적 시간</span>
            <span className="font-medium text-gray-900">
              {formatDuration(todayStats.duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">동기화 상태</span>
          <div className="flex items-center gap-1">
            {syncStatus.isSyncing ? (
              <span className="text-blue-600">동기화 중...</span>
            ) : syncStatus.unsyncedCount > 0 ? (
              <span className="text-orange-600">
                {syncStatus.unsyncedCount}개 대기 중
              </span>
            ) : (
              <span className="text-green-600">동기화 완료</span>
            )}
          </div>
        </div>
        
        {syncStatus.lastSyncTime && (
          <div className="text-xs text-gray-400 mt-1">
            마지막 동기화: {new Date(syncStatus.lastSyncTime).toLocaleTimeString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  );
}
