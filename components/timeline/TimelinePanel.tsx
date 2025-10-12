'use client';

import { useTimelineStore } from '@/lib/stores/timelineStore';
import styles from './TimelinePanel.module.css';

export function TimelinePanel() {
  const {
    selectedYear,
    yearRange,
    setSelectedYear,
    jumpToToday,
    jumpToYearsAgo,
    jumpToRandom,
  } = useTimelineStore();

  const [minYear, maxYear] = yearRange;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  return (
    <aside
      className={styles.panel}
      data-component="TimelinePanel"
      aria-label="타임라인"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>타임머신</h2>
        <div className={styles.yearDisplay}>{selectedYear}</div>
      </div>

      <div className={styles.sliderContainer}>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={selectedYear}
          onChange={handleSliderChange}
          className={styles.slider}
          aria-label="연도 슬라이더"
          data-prop-key="yearSlider"
        />
        <div className={styles.sliderLabels}>
          <span className={styles.sliderLabel}>{minYear}</span>
          <span className={styles.sliderLabel}>{maxYear}</span>
        </div>
      </div>

      <div className={styles.chips}>
        <button
          onClick={jumpToToday}
          className={styles.chip}
          data-action="tm-today"
        >
          오늘로
        </button>
        <button
          onClick={() => jumpToYearsAgo(5)}
          className={styles.chip}
          data-action="tm-5y"
        >
          5년 전
        </button>
        <button
          onClick={jumpToRandom}
          className={styles.chip}
          data-action="tm-random"
        >
          랜덤
        </button>
      </div>

      <div className={styles.memoryListContainer}>
        <h3 className={styles.sectionTitle}>기억</h3>
        <div className={styles.emptyState}>
          <p>이 시기의 기억이 아직 없습니다</p>
          <p className={styles.emptyHint}>
            위치 데이터를 추가하면 여기에 표시됩니다
          </p>
        </div>
      </div>
    </aside>
  );
}
