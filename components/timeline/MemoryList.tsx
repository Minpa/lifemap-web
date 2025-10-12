'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MemoryCard } from './MemoryCard';
import type { Memory } from '@/types';
import styles from './MemoryList.module.css';

interface MemoryListProps {
  memories: Memory[];
  onMemoryClick?: (memory: Memory) => void;
}

export function MemoryList({ memories, onMemoryClick }: MemoryListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: memories.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  if (memories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>이 시기의 기억이 아직 없습니다</p>
        <p className={styles.emptyHint}>
          위치 데이터를 추가하면 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={styles.container}
      role="list"
      aria-label="기억 카드 목록"
      aria-live="polite"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const memory = memories[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MemoryCard
                memory={memory}
                onClick={() => onMemoryClick?.(memory)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
