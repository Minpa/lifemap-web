'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function PrivacyPage() {
  const [privacyRadius, setPrivacyRadius] = useState(500);
  const [maskHome, setMaskHome] = useState(true);
  const [maskWork, setMaskWork] = useState(true);
  const [visibilityLevel, setVisibilityLevel] = useState('private');

  const handleExport = () => {
    alert('데이터 내보내기 기능은 곧 제공됩니다.');
  };

  const handleDelete = () => {
    if (confirm('모든 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      alert('삭제 기능은 곧 제공됩니다.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>프라이버시</h1>
        <p className={styles.description}>
          위치 데이터 보호 및 공유 설정을 관리하세요
        </p>
      </header>

      <section className={styles.section} data-component="PrivacyDashboard">
        <h2 className={styles.sectionTitle}>프라이버시 존</h2>
        <div className={styles.card}>
          <div className={styles.control}>
            <label htmlFor="privacy-radius" className={styles.label}>
              반경: {privacyRadius}m
            </label>
            <input
              id="privacy-radius"
              type="range"
              min="300"
              max="1000"
              step="50"
              value={privacyRadius}
              onChange={(e) => setPrivacyRadius(Number(e.target.value))}
              className={styles.slider}
              data-prop="privacyRadius"
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={maskHome}
                onChange={(e) => setMaskHome(e.target.checked)}
                data-prop="maskHome"
              />
              <span>집 마스킹</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={maskWork}
                onChange={(e) => setMaskWork(e.target.checked)}
                data-prop="maskWork"
              />
              <span>직장 마스킹</span>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>공개 레벨</h2>
        <div className={styles.card}>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibilityLevel === 'private'}
                onChange={(e) => setVisibilityLevel(e.target.value)}
              />
              <span>비공개</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="visibility"
                value="limited"
                checked={visibilityLevel === 'limited'}
                onChange={(e) => setVisibilityLevel(e.target.value)}
              />
              <span>제한 공유</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="visibility"
                value="anonymous"
                checked={visibilityLevel === 'anonymous'}
                onChange={(e) => setVisibilityLevel(e.target.value)}
              />
              <span>익명 공개</span>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>데이터 관리</h2>
        <div className={styles.card}>
          <div className={styles.actions}>
            <button onClick={handleExport} className={styles.exportButton} data-action="export">
              내보내기
            </button>
            <button onClick={handleDelete} className={styles.deleteButton} data-action="delete">
              모든 기록 삭제
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
