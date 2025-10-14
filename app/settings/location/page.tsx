'use client';

/**
 * Location Settings Page
 * 
 * Settings for location tracking
 */

import { useLocationStore } from '@/lib/stores/locationStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { MapPin, Database, Trash2, Download, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStorageStats, clearAllPoints } from '@/lib/db/locationDB';
import type { StorageStats } from '@/lib/location/types';

export default function LocationSettingsPage() {
  const {
    isTracking,
    syncStatus,
    startTracking,
    stopTracking,
    syncNow,
    enableAutoSync,
    disableAutoSync,
  } = useLocationStore();

  const { user } = useAuthStore();

  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load storage stats
  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  };

  // Handle toggle tracking
  const handleToggleTracking = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking(user?.id);
    }
  };

  // Handle toggle auto-sync
  const handleToggleAutoSync = () => {
    if (!user?.id) return;

    if (syncStatus.autoSyncEnabled) {
      disableAutoSync();
    } else {
      enableAutoSync(user.id);
    }
  };

  // Handle sync now
  const handleSyncNow = async () => {
    if (!user?.id) return;
    await syncNow(user.id);
    await loadStorageStats();
  };

  // Handle delete all data
  const handleDeleteAllData = async () => {
    await clearAllPoints();
    await loadStorageStats();
    setShowDeleteConfirm(false);
  };

  // Format size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            위치 추적 설정
          </h1>
          <p className="text-gray-600">
            위치 추적 기능을 관리하고 데이터를 확인하세요
          </p>
        </div>

        {/* Tracking Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">추적 설정</h2>
          </div>

          <div className="space-y-4">
            {/* Enable Tracking */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">위치 추적</div>
                <div className="text-sm text-gray-500">
                  실시간으로 위치를 기록합니다
                </div>
              </div>
              <button
                onClick={handleToggleTracking}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isTracking ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isTracking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Sync */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <div className="font-medium text-gray-900">자동 동기화</div>
                <div className="text-sm text-gray-500">
                  30초마다 서버에 자동으로 동기화합니다
                </div>
              </div>
              <button
                onClick={handleToggleAutoSync}
                disabled={!user?.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  syncStatus.autoSyncEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } ${!user?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    syncStatus.autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">동기화 상태</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">동기화 대기 중</span>
              <span className="font-medium text-gray-900">
                {syncStatus.unsyncedCount}개
              </span>
            </div>

            {syncStatus.lastSyncTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">마지막 동기화</span>
                <span className="font-medium text-gray-900">
                  {new Date(syncStatus.lastSyncTime).toLocaleString('ko-KR')}
                </span>
              </div>
            )}

            <button
              onClick={handleSyncNow}
              disabled={syncStatus.isSyncing || !user?.id}
              className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {syncStatus.isSyncing ? '동기화 중...' : '지금 동기화'}
            </button>
          </div>
        </div>

        {/* Storage Stats */}
        {storageStats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">저장 공간</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">총 위치 기록</span>
                <span className="font-medium text-gray-900">
                  {storageStats.totalPoints}개
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">예상 크기</span>
                <span className="font-medium text-gray-900">
                  {formatSize(storageStats.estimatedSize)}
                </span>
              </div>

              {storageStats.oldestPoint && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">가장 오래된 기록</span>
                  <span className="font-medium text-gray-900">
                    {storageStats.oldestPoint.toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}

              {storageStats.newestPoint && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">가장 최근 기록</span>
                  <span className="font-medium text-gray-900">
                    {storageStats.newestPoint.toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">데이터 관리</h2>
          </div>

          <div className="space-y-3">
            {/* Export Data (Coming Soon) */}
            <button
              disabled
              className="w-full px-4 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed"
            >
              데이터 내보내기 (준비 중)
            </button>

            {/* Delete All Data */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              모든 데이터 삭제
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                모든 데이터를 삭제하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                이 작업은 되돌릴 수 없습니다. 로컬에 저장된 모든 위치 데이터가 삭제됩니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
