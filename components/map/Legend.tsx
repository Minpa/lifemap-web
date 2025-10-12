'use client';

import { useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import styles from './Legend.module.css';

export function Legend() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { palette } = usePreferencesStore();

  return (
    <div
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      aria-live="polite"
      data-component="Legend"
    >
      <button
        className={styles.toggleButton}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? '범례 펼치기' : '범례 접기'}
        aria-expanded={!isCollapsed}
      >
        <span className={styles.toggleIcon}>
          {isCollapsed ? '◀' : '▶'}
        </span>
        <span className={styles.toggleText}>범례</span>
      </button>

      {!isCollapsed && (
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>시간대별 색상</h4>
            <div className={styles.items}>
              <div className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: palette.palette0 }}
                  aria-hidden="true"
                />
                <span className={styles.label}>유년/새벽</span>
              </div>
              <div className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: palette.palette1 }}
                  aria-hidden="true"
                />
                <span className={styles.label}>청춘/낮</span>
              </div>
              <div className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: palette.palette2 }}
                  aria-hidden="true"
                />
                <span className={styles.label}>중년/황혼</span>
              </div>
              <div className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: palette.palette3 }}
                  aria-hidden="true"
                />
                <span className={styles.label}>설렘/강렬</span>
              </div>
              <div className={styles.item}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: palette.palette4 }}
                  aria-hidden="true"
                />
                <span className={styles.label}>고요/깊이</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>시각 요소</h4>
            <div className={styles.items}>
              <div className={styles.item}>
                <span className={`${styles.line} ${styles.thick}`} aria-hidden="true" />
                <span className={styles.label}>오래 머문 곳</span>
              </div>
              <div className={styles.item}>
                <span className={`${styles.line} ${styles.thin}`} aria-hidden="true" />
                <span className={styles.label}>이동 경로</span>
              </div>
              <div className={styles.item}>
                <span className={styles.glow} aria-hidden="true" />
                <span className={styles.label}>감정의 빛</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
