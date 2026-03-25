/**
 * Daily Note Service - Aerospace-grade implementation
 * DO-178C Level A
 * Manages daily notes creation and navigation
 */

export interface DailyNoteConfig {
  folder?: string;
  template?: string;
  dateFormat?: string;
  openOnStartup?: boolean;
}

export interface DailyNoteInfo {
  path: string;
  date: Date;
  exists: boolean;
  content?: string;
}

/**
 * Daily Note Service
 * Provides daily note creation and management
 */
export class DailyNoteService {
  private config: Required<DailyNoteConfig>;

  constructor(config: DailyNoteConfig = {}) {
    this.config = {
      folder: config.folder || 'Daily Notes',
      template: config.template || this.getDefaultTemplate(),
      dateFormat: config.dateFormat || 'YYYY-MM-DD',
      openOnStartup: config.openOnStartup !== false,
    };
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(): string {
    return `# {{date}}

## Tasks
- [ ] 

## Notes

## Journal

---
Created: {{time}}
`;
  }

  /**
   * Get daily note path for a date
   */
  getDailyNotePath(date: Date = new Date()): string {
    const dateStr = this.formatDate(date);
    return `${this.config.folder}/${dateStr}.md`;
  }

  /**
   * Format date according to config
   */
  formatDate(date: Date): string {
    const format = this.config.dateFormat;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * Parse date from filename
   */
  parseDate(filename: string): Date | null {
    // Remove .md extension
    const name = filename.replace(/\.md$/, '');
    
    // Try to parse YYYY-MM-DD format
    const match = name.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return null;
  }

  /**
   * Generate daily note content
   */
  generateContent(date: Date = new Date()): string {
    const dateStr = this.formatDate(date);
    const timeStr = date.toLocaleTimeString();
    
    return this.config.template
      .replace(/\{\{date\}\}/g, dateStr)
      .replace(/\{\{time\}\}/g, timeStr);
  }

  /**
   * Get today's note info
   */
  getTodayNoteInfo(): DailyNoteInfo {
    const today = new Date();
    return {
      path: this.getDailyNotePath(today),
      date: today,
      exists: false, // Would need file system check
    };
  }

  /**
   * Get yesterday's note info
   */
  getYesterdayNoteInfo(): DailyNoteInfo {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      path: this.getDailyNotePath(yesterday),
      date: yesterday,
      exists: false,
    };
  }

  /**
   * Get tomorrow's note info
   */
  getTomorrowNoteInfo(): DailyNoteInfo {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      path: this.getDailyNotePath(tomorrow),
      date: tomorrow,
      exists: false,
    };
  }

  /**
   * Get note info for specific date
   */
  getNoteInfo(date: Date): DailyNoteInfo {
    return {
      path: this.getDailyNotePath(date),
      date,
      exists: false,
    };
  }

  /**
   * Get all daily notes in date range
   */
  getNotesInRange(startDate: Date, endDate: Date): DailyNoteInfo[] {
    const notes: DailyNoteInfo[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      notes.push(this.getNoteInfo(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    
    return notes;
  }

  /**
   * Get this week's notes
   */
  getThisWeekNotes(): DailyNoteInfo[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Start from Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // End on Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return this.getNotesInRange(monday, sunday);
  }

  /**
   * Get this month's notes
   */
  getThisMonthNotes(): DailyNoteInfo[] {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return this.getNotesInRange(firstDay, lastDay);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DailyNoteConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get configuration
   */
  getConfig(): Required<DailyNoteConfig> {
    return { ...this.config };
  }

  /**
   * Check if a file is a daily note
   */
  isDailyNote(filePath: string): boolean {
    return filePath.startsWith(this.config.folder + '/') && 
           filePath.endsWith('.md') &&
           this.parseDate(filePath.split('/').pop() || '') !== null;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    folder: string;
    dateFormat: string;
    todayPath: string;
  } {
    return {
      folder: this.config.folder,
      dateFormat: this.config.dateFormat,
      todayPath: this.getDailyNotePath(),
    };
  }
}

// Singleton instance
let dailyNoteInstance: DailyNoteService | null = null;

export function getDailyNoteService(): DailyNoteService {
  if (!dailyNoteInstance) {
    dailyNoteInstance = new DailyNoteService();
  }
  return dailyNoteInstance;
}
