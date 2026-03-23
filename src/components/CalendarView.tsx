import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { FileItem } from '../types';
import { log } from '../utils/logger';

/**
 * Calendar View Component
 * Displays a calendar grid for daily notes navigation
 */

interface CalendarViewProps {
  files: FileItem[];
  onDateSelect: (date: Date) => void;
  onCreateDailyNote: (date: Date) => void;
  currentDate?: Date;
}

export default function CalendarView({
  files,
  onDateSelect,
  onCreateDailyNote,
  currentDate = new Date(),
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(new Date());

  // Get daily notes from files
  const dailyNotes = useMemo(() => {
    const notes = new Map<string, FileItem>();
    
    files.forEach(file => {
      // Match daily note pattern: YYYY-MM-DD.md
      const match = file.name.match(/^(\d{4})-(\d{2})-(\d{2})\.md$/);
      if (match) {
        const dateKey = `${match[1]}-${match[2]}-${match[3]}`;
        notes.set(dateKey, file);
      }
    });
    
    return notes;
  }, [files]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to fill
    const prevMonthDays = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Generate days array
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasNote: boolean;
    }> = [];
    
    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasNote: dailyNotes.has(formatDateKey(date)),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const today = new Date();
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        hasNote: dailyNotes.has(formatDateKey(date)),
      });
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasNote: dailyNotes.has(formatDateKey(date)),
      });
    }
    
    return days;
  }, [viewDate, dailyNotes]);

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const handleToday = () => {
    setViewDate(new Date());
  };

  const handleDayClick = (date: Date, hasNote: boolean) => {
    if (hasNote) {
      onDateSelect(date);
    } else {
      onCreateDailyNote(date);
    }
    log.info('[CalendarView] Date clicked:', formatDateKey(date), 'hasNote:', hasNote);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Calendar</h3>
          </div>
          
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-sm font-semibold">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-foreground/60 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day.date, day.hasNote)}
              className={`
                aspect-square p-1 rounded text-sm transition-colors relative
                ${day.isCurrentMonth
                  ? 'text-foreground hover:bg-secondary'
                  : 'text-foreground/30 hover:bg-secondary/50'
                }
                ${day.isToday
                  ? 'bg-primary/20 border border-primary'
                  : ''
                }
                ${day.hasNote
                  ? 'font-semibold'
                  : ''
                }
              `}
              title={
                day.hasNote
                  ? `Open note for ${formatDateKey(day.date)}`
                  : `Create note for ${formatDateKey(day.date)}`
              }
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day.date.getDate()}</span>
                {day.hasNote && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />
                )}
                {!day.hasNote && day.isCurrentMonth && (
                  <Plus
                    size={10}
                    className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-50"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-secondary/30 text-xs text-foreground/60">
        <div className="flex items-center justify-between">
          <span>{dailyNotes.size} daily notes</span>
          <span>Click to open or create</span>
        </div>
      </div>
    </div>
  );
}
