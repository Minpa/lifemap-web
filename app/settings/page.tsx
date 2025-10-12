'use client';

import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import styles from './page.module.css';

export default function SettingsPage() {
  const { language, units, journalReminder, setLanguage, setUnits, setJournalReminder } =
    usePreferencesStore();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>설정</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>언어</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'ko' | 'en' | 'ja')}
          className={styles.select}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>단위</h2>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="metric"
              checked={units === 'metric'}
              onChange={(e) => setUnits(e.target.value as 'metric')}
            />
            <span>미터법 (km, m)</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="imperial"
              checked={units === 'imperial'}
              onChange={(e) => setUnits(e.target.value as 'imperial')}
            />
            <span>야드파운드법 (mi, ft)</span>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>일기 알림</h2>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={journalReminder?.enabled || false}
            onChange={(e) =>
              setJournalReminder(e.target.checked, journalReminder?.time || '20:00')
            }
          />
          <span>매일 알림 받기</span>
        </label>
        {journalReminder?.enabled && (
          <input
            type="time"
            value={journalReminder.time}
            onChange={(e) => setJournalReminder(true, e.target.value)}
            className={styles.timeInput}
          />
        )}
      </section>
    </div>
  );
}
