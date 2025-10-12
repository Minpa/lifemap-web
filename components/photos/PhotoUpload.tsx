'use client';

import { useState, useRef } from 'react';
import { extractExifData, isValidPhotoFile } from '@/lib/exifUtils';
import type { Photo } from '@/types';
import styles from './PhotoUpload.module.css';

interface PhotoUploadProps {
  onUpload: (photos: Partial<Photo>[]) => Promise<void>;
  multiple?: boolean;
}

export function PhotoUpload({ onUpload, multiple = true }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(isValidPhotoFile);

    if (validFiles.length === 0) {
      alert('유효한 이미지 파일을 선택해주세요 (JPEG, PNG, HEIC, 최대 50MB)');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const photos: Partial<Photo>[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setProgress(((i + 1) / validFiles.length) * 100);

        // Extract EXIF data
        const exifData = await extractExifData(file);

        // Create object URL for preview
        const url = URL.createObjectURL(file);

        const photo: Partial<Photo> = {
          filename: file.name,
          url,
          thumbnailUrl: url, // Will be replaced with actual thumbnail
          timestamp: exifData?.timestamp || new Date(file.lastModified),
          latitude: exifData?.latitude,
          longitude: exifData?.longitude,
          exif: exifData?.exif || {
            width: 0,
            height: 0,
          },
          hash: exifData?.hash || '',
        };

        photos.push(photo);
      }

      await onUpload(photos);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${
          isUploading ? styles.uploading : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="사진 업로드"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/heic"
          multiple={multiple}
          onChange={handleFileChange}
          className={styles.fileInput}
          aria-hidden="true"
        />

        {isUploading ? (
          <div className={styles.uploadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.uploadingText}>업로드 중...</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressText}>{Math.round(progress)}%</p>
          </div>
        ) : (
          <div className={styles.defaultState}>
            <div className={styles.icon} aria-hidden="true">
              📸
            </div>
            <p className={styles.title}>
              사진을 드래그하거나 클릭하여 업로드
            </p>
            <p className={styles.subtitle}>
              JPEG, PNG, HEIC • 최대 50MB
            </p>
            <p className={styles.hint}>
              GPS 정보가 있는 사진은 자동으로 지도에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
