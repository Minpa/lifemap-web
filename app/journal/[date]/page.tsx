'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MarkdownEditor } from '@/components/journal/MarkdownEditor';
import { useJournalStore } from '@/lib/stores/journalStore';
import styles from './page.module.css';

interface PageProps {
  params: {
    date: string;
  };
}

export default function JournalEntryPage({ params }: PageProps) {
  const router = useRouter();
  const { currentEntry, setCurrentEntry, setSaving, updateLastSaved } = useJournalStore();
  
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const date = parse(params.date, 'yyyy-MM-dd', new Date());
  const formattedDate = format(date, 'PPP EEEE', { locale: ko });

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!content) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 30000);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaving(true);

    // Simulate save - will be replaced with actual IndexedDB save
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLastSaved(new Date());
    updateLastSaved();
    setIsSaving(false);
    setSaving(false);
  }, [content, setSaving, updateLastSaved]);

  const handleBack = () => {
    if (content && !lastSaved) {
      if (confirm('저장하지 않은 변경사항이 있습니다. 나가시겠습니까?')) {
        router.push('/journal');
      }
    } else {
      router.push('/journal');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={handleBack}
          className={styles.backButton}
          aria-label="목록으로 돌아가기"
        >
          ← 목록
        </button>
        <div className={styles.headerInfo}>
          <time className={styles.date} dateTime={params.date}>
            {formattedDate}
          </time>
          {isSaving && (
            <span className={styles.savingIndicator}>저장 중...</span>
          )}
          {lastSaved && !isSaving && (
            <span className={styles.savedIndicator}>
              {format(lastSaved, 'HH:mm')}에 저장됨
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className={styles.saveButton}
          disabled={isSaving}
        >
          저장
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.editorSection}>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onSave={handleSave}
          />
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>오늘의 타임라인</h3>
            <div className={styles.timelinePlaceholder}>
              <p className={styles.placeholderText}>
                위치 데이터를 추가하면 자동으로 타임라인이 생성됩니다
              </p>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>사진</h3>
            <button className={styles.addPhotoButton}>
              + 사진 추가
            </button>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>기분</h3>
            <div className={styles.moodSelector}>
              {['😊', '😢', '🤩', '😌', '😰', '🙏', '🤔'].map((emoji) => (
                <button
                  key={emoji}
                  className={styles.moodButton}
                  aria-label={`기분: ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
