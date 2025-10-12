'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { JournalCalendar } from '@/components/journal/JournalCalendar';
import { JournalPreviewCard } from '@/components/journal/JournalPreviewCard';
import type { JournalEntry } from '@/types';
import styles from './page.module.css';

export default function JournalPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with actual data from IndexedDB
  const mockEntries: JournalEntry[] = [];
  const entriesMap = new Map<string, boolean>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    router.push(`/journal/${dateStr}`);
  };

  const handleEntryClick = (entry: JournalEntry) => {
    router.push(`/journal/${entry.date}`);
  };

  const filteredEntries = mockEntries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>일기</h1>
        <button
          onClick={() => router.push(`/journal/${format(new Date(), 'yyyy-MM-dd')}`)}
          className={styles.newButton}
        >
          + 새 일기
        </button>
      </header>

      <div className={styles.search}>
        <input
          type="search"
          placeholder="일기 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="일기 검색"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.calendarSection}>
          <JournalCalendar
            entriesMap={entriesMap}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>

        <div className={styles.entriesSection}>
          {filteredEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h2 className={styles.emptyTitle}>일기가 없습니다</h2>
              <p className={styles.emptyText}>
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '첫 일기를 작성해보세요'}
              </p>
              <button
                onClick={() => router.push(`/journal/${format(new Date(), 'yyyy-MM-dd')}`)}
                className={styles.emptyButton}
              >
                일기 쓰기
              </button>
            </div>
          ) : (
            <div className={styles.entriesList}>
              {filteredEntries.map((entry) => (
                <JournalPreviewCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleEntryClick(entry)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
