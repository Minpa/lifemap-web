'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  placeholder = '오늘 하루는 어땠나요?',
}: MarkdownEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value]);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }

    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**');
    }

    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*');
    }
  };

  return (
    <div className={styles.container}>
      {showToolbar && (
        <div className={styles.toolbar} role="toolbar" aria-label="서식 도구">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className={styles.toolButton}
            title="굵게 (Cmd+B)"
            aria-label="굵게"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className={styles.toolButton}
            title="기울임 (Cmd+I)"
            aria-label="기울임"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            className={styles.toolButton}
            title="제목"
            aria-label="제목"
          >
            H
          </button>
          <button
            onClick={() => insertMarkdown('- ')}
            className={styles.toolButton}
            title="목록"
            aria-label="목록"
          >
            •
          </button>
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className={styles.toolButton}
            title="링크"
            aria-label="링크"
          >
            🔗
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowToolbar(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.textarea}
        aria-label="일기 내용"
      />

      <div className={styles.footer}>
        <span className={styles.hint}>
          Markdown 지원 • Cmd+S로 저장
        </span>
        <span className={styles.wordCount}>
          {value.length.toLocaleString()}자
        </span>
      </div>
    </div>
  );
}
