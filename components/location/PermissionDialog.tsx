'use client';

/**
 * Permission Dialog Component
 * 
 * Dialog for requesting location permissions
 */

import { MapPin, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
  permissionStatus: PermissionState;
}

export function PermissionDialog({
  isOpen,
  onClose,
  onRequestPermission,
  permissionStatus,
}: PermissionDialogProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  // Show instructions if permission is denied
  useEffect(() => {
    if (permissionStatus === 'denied') {
      setShowInstructions(true);
    }
  }, [permissionStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            위치 권한 필요
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {permissionStatus === 'denied' ? (
            // Permission Denied
            <>
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-center font-medium text-gray-900 mb-2">
                위치 권한이 거부되었습니다
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                위치 추적 기능을 사용하려면 브라우저 설정에서 위치 권한을 허용해주세요.
              </p>

              {showInstructions && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                  <p className="font-medium">권한 허용 방법:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>브라우저 주소창 왼쪽의 자물쇠 아이콘 클릭</li>
                    <li>&quot;위치&quot; 또는 &quot;Location&quot; 찾기</li>
                    <li>&quot;허용&quot; 또는 &quot;Allow&quot; 선택</li>
                    <li>페이지 새로고침</li>
                  </ol>
                </div>
              )}
            </>
          ) : (
            // Permission Request
            <>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              
              <h3 className="text-center font-medium text-gray-900 mb-2">
                위치 추적을 시작하시겠습니까?
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                이 앱은 사용자의 위치를 추적하여 지도에 표시합니다. 
                위치 데이터는 암호화되어 안전하게 저장됩니다.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                <p className="font-medium">위치 추적 기능:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>실시간 위치 기록</li>
                  <li>이동 경로 시각화</li>
                  <li>이동 거리 및 시간 통계</li>
                  <li>종단간 암호화로 개인정보 보호</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          
          {permissionStatus !== 'denied' && (
            <button
              onClick={() => {
                onRequestPermission();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              권한 허용
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
