'use client';

import { useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import type { PaletteColors } from '@/types';
import styles from './PalettePanel.module.css';

const paletteLabels: Record<keyof PaletteColors, string> = {
  palette0: '유년/새벽',
  palette1: '청춘/낮',
  palette2: '중년/황혼',
  palette3: '설렘/강렬',
  palette4: '고요/깊이',
};

export function PalettePanel() {
  const {
    palette,
    thicknessScale,
    glowIntensity,
    setPaletteColor,
    setThicknessScale,
    setGlowIntensity,
  } = usePreferencesStore();

  const [activeColor, setActiveColor] = useState<keyof PaletteColors | null>(
    null
  );

  const handleColorChange = (
    slot: keyof PaletteColors,
    color: string
  ) => {
    setPaletteColor(slot, color);
  };

  return (
    <section
      className={styles.panel}
      data-component="PalettePanel"
      aria-label="팔레트"
    >
      <header className={styles.header}>
        <h3 className={styles.title}>나의 팔레트</h3>
        <p className={styles.description}>
          지도의 색상과 스타일을 커스터마이즈하세요
        </p>
      </header>

      <div className={styles.swatches}>
        {(Object.keys(palette) as Array<keyof PaletteColors>).map((slot) => (
          <div key={slot} className={styles.swatchContainer}>
            <label className={styles.swatchLabel}>
              {paletteLabels[slot]}
            </label>
            <div className={styles.swatchWrapper}>
              <button
                className={styles.swatch}
                style={{ backgroundColor: palette[slot] }}
                onClick={() => setActiveColor(slot)}
                aria-label={`${paletteLabels[slot]} 색상 선택`}
                data-prop-color={`--${slot}`}
              />
              <input
                type="color"
                value={palette[slot]}
                onChange={(e) => handleColorChange(slot, e.target.value)}
                className={styles.colorInput}
                aria-label={`${paletteLabels[slot]} 색상 입력`}
              />
            </div>
            <span className={styles.colorValue}>{palette[slot]}</span>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="thickness-scale" className={styles.controlLabel}>
            두께 스케일
            <span className={styles.controlValue}>{thicknessScale}%</span>
          </label>
          <input
            id="thickness-scale"
            type="range"
            min="0"
            max="100"
            value={thicknessScale}
            onChange={(e) => setThicknessScale(parseInt(e.target.value))}
            className={styles.slider}
            data-prop="thicknessScale"
          />
        </div>

        <div className={styles.control}>
          <label htmlFor="glow-intensity" className={styles.controlLabel}>
            발광 강도
            <span className={styles.controlValue}>{glowIntensity}%</span>
          </label>
          <input
            id="glow-intensity"
            type="range"
            min="0"
            max="100"
            value={glowIntensity}
            onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
            className={styles.slider}
            data-prop="glow"
          />
        </div>
      </div>

      <div className={styles.preview}>
        <h4 className={styles.previewTitle}>미리보기</h4>
        <div className={styles.previewContent}>
          <div className={styles.previewGradient}>
            {(Object.keys(palette) as Array<keyof PaletteColors>).map(
              (slot, index) => (
                <div
                  key={slot}
                  className={styles.previewBar}
                  style={{
                    backgroundColor: palette[slot],
                    opacity: 0.8 + index * 0.05,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
