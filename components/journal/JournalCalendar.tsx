'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import styles from './JournalCalendar.module.css';

interface JournalCalendarProps {
  entriesMap: Map<string, boolean>; // date string -> has entry
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}

export function JournalCalendar({ entriesMap, onDateClick, selectedDate }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          onClick={previousMonth}
          className={styles.navButton}
          aria-label="이전 달"
        >
          ‹
        </button>
        <h2 className={styles.monthTitle}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <button
          onClick={nextMonth}
          className={styles.navButton}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className={styles.weekDays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.days}>
        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.dayEmpty} />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasEntry = entriesMap.has(dateKey);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onDateClick(day)}
              className={`${styles.day} ${hasEntry ? styles.hasEntry : ''} ${
                isSelected ? styles.selected : ''
              } ${isCurrentDay ? styles.today : ''}`}
              aria-label={`${format(day, 'M월 d일', { locale: ko })}${
                hasEntry ? ' - 일기 있음' : ''
              }`}
            >
              <span className={styles.dayNumber}>{format(day, 'd')}</span>
              {hasEntry && <span className={styles.dot} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
