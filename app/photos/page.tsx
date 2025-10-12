'use client';

import { useState } from 'react';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PhotoGrid } from '@/components/photos/PhotoGrid';
import { PhotoViewer } from '@/components/photos/PhotoViewer';
import type { Photo } from '@/types';
import styles from './page.module.css';

type SortOption = 'date' | 'location' | 'album';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showUpload, setShowUpload] = useState(false);

  const handleUpload = async (newPhotos: Partial<Photo>[]) => {
    // Mock implementation - will be replaced with actual IndexedDB save
    const photosWithIds = newPhotos.map((photo, index) => ({
      ...photo,
      id: `photo-${Date.now()}-${index}`,
    })) as Photo[];

    setPhotos([...photos, ...photosWithIds]);
    setShowUpload(false);
  };

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedPhoto(photos[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedPhoto(photos[prevIndex]);
    }
  };

  const handleCaptionChange = (caption: string) => {
    if (!selectedPhoto) return;
    
    const updatedPhotos = photos.map((p) =>
      p.id === selectedPhoto.id ? { ...p, caption } : p
    );
    setPhotos(updatedPhotos);
    setSelectedPhoto({ ...selectedPhoto, caption });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>사진</h1>
        <div className={styles.controls}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
            aria-label="정렬 기준"
          >
            <option value="date">날짜순</option>
            <option value="location">위치순</option>
            <option value="album">앨범순</option>
          </select>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className={styles.uploadButton}
          >
            {showUpload ? '취소' : '+ 사진 추가'}
          </button>
        </div>
      </header>

      {showUpload && (
        <div className={styles.uploadSection}>
          <PhotoUpload onUpload={handleUpload} />
        </div>
      )}

      <div className={styles.stats}>
        <span className={styles.statItem}>
          총 {photos.length.toLocaleString()}장
        </span>
        {photos.filter((p) => p.latitude && p.longitude).length > 0 && (
          <span className={styles.statItem}>
            위치 정보 {photos.filter((p) => p.latitude && p.longitude).length}장
          </span>
        )}
      </div>

      <div className={styles.gallery}>
        <PhotoGrid
          photos={photos}
          onPhotoClick={handlePhotoClick}
          columns={4}
        />
      </div>

      <PhotoViewer
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNext={selectedIndex < photos.length - 1 ? handleNext : undefined}
        onPrevious={selectedIndex > 0 ? handlePrevious : undefined}
        onCaptionChange={handleCaptionChange}
      />
    </div>
  );
}
