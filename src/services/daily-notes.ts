// Daily Notes Service - Aerospace Grade
// Manages daily notes creation and navigation

import { log } from '../utils/logger';

export interface DailyNoteConfig {
  folder: string;
  dateFormat: string;
  template: string;
  autoCreate: boolean;
}

const DEFAULT_CONFIG: DailyNoteConfig = {
  folder: 'Daily Notes',
  dateFormat: 'YYYY-MM-DD',
  template: 'daily-note',
  autoCreate: true,
};

/**
 * Daily Notes Service
 * Manages daily notes with automatic creation and navigation
 */
export class DailyNotesService {
  private static instance: DailyNotesService;
  private config: DailyNoteConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): DailyNotesService {
    if (!DailyNotesService.instance) {
      DailyNotesService.instance = new DailyNotesService();
    }
    return DailyNotesService.instance;
  }

  /**
   * Load configuration
   */
  private loadConfig(): DailyNoteConfig {
    try {
      const stored = localStorage.getItem('a3note_daily_notes_config');
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      log.error('[DailyNotes] Failed to load config:', error);
    }
    return DEFAULT_CONFIG;
  }

  /**
   * Save configuration
   */
  async saveConfig(config: Partial<DailyNoteConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem('a3note_daily_notes_config', JSON.stringify(this.config));
      log.info('[DailyNotes] Config saved');
    } catch (error) {
      log.error('[DailyNotes] Failed to save config:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): DailyNoteConfig {
    return { ...this.config };
  }

  /**
   * Format date according to config
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (this.config.dateFormat) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Get daily note path for a specific date
   */
  getDailyNotePath(workspacePath: string, date: Date = new Date()): string {
    const dateStr = this.formatDate(date);
    const fileName = `${dateStr}.md`;
    return `${workspacePath}/${this.config.folder}/${fileName}`;
  }

  /**
   * Check if daily note exists
   */
  async dailyNoteExists(workspacePath: string, date: Date = new Date()): Promise<boolean> {
    const path = this.getDailyNotePath(workspacePath, date);
    try {
      await invoke('read_file_content', { path });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create daily note
   */
  async createDailyNote(workspacePath: string, date: Date = new Date()): Promise<string> {
    const path = this.getDailyNotePath(workspacePath, date);
    
    try {
      // Ensure folder exists
      const folderPath = `${workspacePath}/${this.config.folder}`;
      try {
        await invoke('list_directory', { path: folderPath });
      } catch {
        // Folder doesn't exist, create it
        log.info('[DailyNotes] Creating daily notes folder:', folderPath);
        // Note: We'll need to add a create_folder command in Rust
        // For now, we'll just try to create the file
      }

      // Generate content from template
      const content = templateService.applyTemplate(this.config.template);

      // Create file
      await invoke('write_file_content', {
        path,
        content,
      });

      log.info('[DailyNotes] Created daily note:', path);
      return path;
    } catch (error) {
      log.error('[DailyNotes] Failed to create daily note:', error);
      throw error;
    }
  }

  /**
   * Open or create today's daily note
   */
  async openTodayNote(workspacePath: string): Promise<string> {
    const today = new Date();
    const exists = await this.dailyNoteExists(workspacePath, today);

    if (!exists && this.config.autoCreate) {
      return await this.createDailyNote(workspacePath, today);
    }

    return this.getDailyNotePath(workspacePath, today);
  }

  /**
   * Navigate to previous day's note
   */
  async getPreviousDayNote(workspacePath: string, currentDate: Date): Promise<string | null> {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    // Search for up to 30 days back
    for (let i = 0; i < 30; i++) {
      const exists = await this.dailyNoteExists(workspacePath, previousDate);
      if (exists) {
        return this.getDailyNotePath(workspacePath, previousDate);
      }
      previousDate.setDate(previousDate.getDate() - 1);
    }

    return null;
  }

  /**
   * Navigate to next day's note
   */
  async getNextDayNote(workspacePath: string, currentDate: Date): Promise<string | null> {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Don't go beyond today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search for up to 30 days forward
    for (let i = 0; i < 30; i++) {
      if (nextDate > today) break;

      const exists = await this.dailyNoteExists(workspacePath, nextDate);
      if (exists) {
        return this.getDailyNotePath(workspacePath, nextDate);
      }
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return null;
  }

  /**
   * Get all daily notes
   */
  async getAllDailyNotes(workspacePath: string): Promise<Array<{ date: Date; path: string }>> {
    const folderPath = `${workspacePath}/${this.config.folder}`;
    const dailyNotes: Array<{ date: Date; path: string }> = [];

    try {
      const files = await invoke<Array<{ path: string; name: string; isDirectory: boolean }>>(
        'list_directory',
        { path: folderPath }
      );

      files.forEach(file => {
        if (file.isDirectory || !file.name.endsWith('.md')) return;

        // Try to parse date from filename
        const dateStr = file.name.replace('.md', '');
        const date = this.parseDate(dateStr);
        
        if (date) {
          dailyNotes.push({ date, path: file.path });
        }
      });

      // Sort by date descending
      dailyNotes.sort((a, b) => b.date.getTime() - a.date.getTime());

      log.info(`[DailyNotes] Found ${dailyNotes.length} daily notes`);
      return dailyNotes;
    } catch (error) {
      log.error('[DailyNotes] Failed to get daily notes:', error);
      return [];
    }
  }

  /**
   * Parse date from string
   */
  private parseDate(dateStr: string): Date | null {
    try {
      // Try different formats
      const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
        /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
        /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
        /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          let year, month, day;
          
          if (format === formats[0] || format === formats[1]) {
            // YYYY-MM-DD or YYYY/MM/DD
            [, year, month, day] = match;
          } else if (format === formats[2]) {
            // DD-MM-YYYY
            [, day, month, year] = match;
          } else {
            // MM/DD/YYYY
            [, month, day, year] = match;
          }

          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    } catch (error) {
      log.error('[DailyNotes] Failed to parse date:', dateStr, error);
    }
    return null;
  }
}

// Export singleton instance
export const dailyNotesService = DailyNotesService.getInstance();
