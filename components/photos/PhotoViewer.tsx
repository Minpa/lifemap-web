'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Modal } from '@/components/Modal';
import { formatExifForDisplay } from '@/lib/exifUtils';
import type { Photo } from '@/types';
import styles from './PhotoViewer.module.css';

interface PhotoViewerProps {
  photo: Photo | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onCaptionChange?: (caption: string) => void;
}

export function PhotoViewer({
  photo,
  onClose,
  onNext,
  onPrevious,
  onCaptionChange,
}: PhotoViewerProps) {
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onNext, onPrevious]);

  if (!photo) return null;

  const exifLines = formatExifForDisplay(photo.exif);
  const formattedDate = format(photo.timestamp, 'PPP HH:mm', { locale: ko });

  return (
    <Modal isOpen={!!photo} onClose={onClose} size="lg">
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img
            src={photo.url}
            alt={photo.caption || photo.filename}
            className={styles.image}
          />

          {(onPrevious || onNext) && (
            <div className={styles.navigation}>
              {onPrevious && (
                <button
                  onClick={onPrevious}
                  className={styles.navButton}
                  aria-label="이전 사진"
                >
                  ‹
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className={styles.navButton}
                  aria-label="다음 사진"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.metadata}>
            <h3 className={styles.filename}>{photo.filename}</h3>
            <time className={styles.date} dateTime={photo.timestamp.toISOString()}>
              {formattedDate}
            </time>
          </div>

          {photo.latitude && photo.longitude && (
            <div className={styles.location}>
              <span className={styles.locationIcon} aria-hidden="true">
                📍
              </span>
              <span className={styles.coordinates}>
                {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
              </span>
            </div>
          )}

          <div className={styles.captionSection}>
            <label htmlFor="photo-caption" className={styles.label}>
              캡션
            </label>
            <textarea
              id="photo-caption"
              value={photo.caption || ''}
              onChange={(e) => onCaptionChange?.(e.target.value)}
              placeholder="사진에 대한 설명을 추가하세요..."
              className={styles.captionInput}
              rows={3}
            />
          </div>

          {exifLines.length > 0 && (
            <div className={styles.exifSection}>
              <h4 className={styles.exifTitle}>EXIF 정보</h4>
              <div className={styles.exifData}>
                {exifLines.map((line, index) => (
                  <span key={index} className={styles.exifItem}>
                    {line}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
