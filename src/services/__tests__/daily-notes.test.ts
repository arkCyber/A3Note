// DailyNotes Service Tests - Aerospace Grade

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dailyNotesService, DailyNoteConfig } from '../daily-notes';

// Mock Tauri API
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import('@tauri-apps/api/tauri');

describe('DailyNotesService', () => {
  const mockWorkspacePath = '/test/workspace';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Configuration', () => {
    it('should return default configuration', () => {
      const config = dailyNotesService.getConfig();
      
      expect(config).toEqual({
        folder: 'Daily Notes',
        dateFormat: 'YYYY-MM-DD',
        template: 'daily-note',
        autoCreate: true,
      });
    });

    it('should save configuration', async () => {
      const newConfig: Partial<DailyNoteConfig> = {
        folder: 'Journal',
        dateFormat: 'DD-MM-YYYY',
      };

      await dailyNotesService.saveConfig(newConfig);
      const config = dailyNotesService.getConfig();

      expect(config.folder).toBe('Journal');
      expect(config.dateFormat).toBe('DD-MM-YYYY');
    });

    it('should persist configuration to localStorage', async () => {
      const newConfig: Partial<DailyNoteConfig> = {
        folder: 'Journal',
      };

      await dailyNotesService.saveConfig(newConfig);
      
      const stored = localStorage.getItem('a3note_daily_notes_config');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.folder).toBe('Journal');
    });

    it('should load configuration from localStorage', async () => {
      const config = {
        folder: 'Custom Folder',
        dateFormat: 'MM-DD-YYYY',
        template: 'custom-template',
        autoCreate: false,
      };

      localStorage.setItem('a3note_daily_notes_config', JSON.stringify(config));
      
      // Create new instance to load from storage
      const loadedConfig = dailyNotesService.getConfig();
      expect(loadedConfig.folder).toBe('Custom Folder');
    });
  });

  describe('Date Formatting', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-03-15');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/2024-03-15.md');
    });

    it('should format date as YYYY/MM/DD', async () => {
      await dailyNotesService.saveConfig({ dateFormat: 'YYYY/MM/DD' });
      
      const date = new Date('2024-03-15');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/2024/03/15.md');
    });

    it('should format date as DD-MM-YYYY', async () => {
      await dailyNotesService.saveConfig({ dateFormat: 'DD-MM-YYYY' });
      
      const date = new Date('2024-03-15');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/15-03-2024.md');
    });

    it('should format date as MM-DD-YYYY', async () => {
      await dailyNotesService.saveConfig({ dateFormat: 'MM-DD-YYYY' });
      
      const date = new Date('2024-03-15');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/03-15-2024.md');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-01-05');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/2024-01-05.md');
    });
  });

  describe('Daily Note Path', () => {
    it('should generate path for today by default', () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath);
      
      expect(path).toBe(`/test/workspace/Daily Notes/${year}-${month}-${day}.md`);
    });

    it('should generate path for specific date', () => {
      const date = new Date('2024-12-25');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/2024-12-25.md');
    });

    it('should use custom folder from config', async () => {
      await dailyNotesService.saveConfig({ folder: 'Journal' });
      
      const date = new Date('2024-03-15');
      const path = dailyNotesService.getDailyNotePath(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Journal/2024-03-15.md');
    });
  });

  describe('Daily Note Existence', () => {
    it('should return true if daily note exists', async () => {
      (invoke as any).mockResolvedValue('# Daily Note Content');
      
      const date = new Date('2024-03-15');
      const exists = await dailyNotesService.dailyNoteExists(mockWorkspacePath, date);
      
      expect(exists).toBe(true);
      expect(invoke).toHaveBeenCalledWith('read_file_content', {
        path: '/test/workspace/Daily Notes/2024-03-15.md',
      });
    });

    it('should return false if daily note does not exist', async () => {
      (invoke as any).mockRejectedValue(new Error('File not found'));
      
      const date = new Date('2024-03-15');
      const exists = await dailyNotesService.dailyNoteExists(mockWorkspacePath, date);
      
      expect(exists).toBe(false);
    });
  });

  describe('Daily Note Creation', () => {
    it('should create daily note with template', async () => {
      (invoke as any).mockResolvedValue(null);
      
      const date = new Date('2024-03-15');
      const path = await dailyNotesService.createDailyNote(mockWorkspacePath, date);
      
      expect(path).toBe('/test/workspace/Daily Notes/2024-03-15.md');
      expect(invoke).toHaveBeenCalledWith('write_file_content', expect.objectContaining({
        path: '/test/workspace/Daily Notes/2024-03-15.md',
        content: expect.any(String),
      }));
    });

    it('should handle creation errors', async () => {
      (invoke as any).mockRejectedValue(new Error('Write failed'));
      
      const date = new Date('2024-03-15');
      
      await expect(dailyNotesService.createDailyNote(mockWorkspacePath, date)).rejects.toThrow();
    });
  });

  describe('Open Today Note', () => {
    it('should return existing note path if exists', async () => {
      (invoke as any).mockResolvedValue('# Existing Note');
      
      const path = await dailyNotesService.openTodayNote(mockWorkspacePath);
      
      expect(path).toContain('Daily Notes');
      expect(path).toContain('.md');
    });

    it('should create note if does not exist and autoCreate is true', async () => {
      (invoke as any)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce(null);
      
      const path = await dailyNotesService.openTodayNote(mockWorkspacePath);
      
      expect(path).toContain('Daily Notes');
      expect(invoke).toHaveBeenCalledWith('write_file_content', expect.any(Object));
    });

    it('should not create note if autoCreate is false', async () => {
      await dailyNotesService.saveConfig({ autoCreate: false });
      (invoke as any).mockRejectedValue(new Error('File not found'));
      
      const path = await dailyNotesService.openTodayNote(mockWorkspacePath);
      
      expect(path).toContain('Daily Notes');
      expect(invoke).not.toHaveBeenCalledWith('write_file_content', expect.any(Object));
    });
  });

  describe('Navigation', () => {
    it('should find previous day note', async () => {
      const currentDate = new Date('2024-03-15');
      
      (invoke as any).mockImplementation((cmd: string, args: any) => {
        if (args.path.includes('2024-03-14')) {
          return Promise.resolve('# Previous Day');
        }
        return Promise.reject(new Error('Not found'));
      });
      
      const prevPath = await dailyNotesService.getPreviousDayNote(mockWorkspacePath, currentDate);
      
      expect(prevPath).toBe('/test/workspace/Daily Notes/2024-03-14.md');
    });

    it('should return null if no previous note found within 30 days', async () => {
      (invoke as any).mockRejectedValue(new Error('Not found'));
      
      const currentDate = new Date('2024-03-15');
      const prevPath = await dailyNotesService.getPreviousDayNote(mockWorkspacePath, currentDate);
      
      expect(prevPath).toBeNull();
    });

    it('should find next day note', async () => {
      const currentDate = new Date('2024-03-15');
      
      (invoke as any).mockImplementation((cmd: string, args: any) => {
        if (args.path.includes('2024-03-16')) {
          return Promise.resolve('# Next Day');
        }
        return Promise.reject(new Error('Not found'));
      });
      
      const nextPath = await dailyNotesService.getNextDayNote(mockWorkspacePath, currentDate);
      
      expect(nextPath).toBe('/test/workspace/Daily Notes/2024-03-16.md');
    });

    it('should not go beyond today for next note', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextPath = await dailyNotesService.getNextDayNote(mockWorkspacePath, tomorrow);
      
      expect(nextPath).toBeNull();
    });
  });

  describe('Get All Daily Notes', () => {
    it('should return all daily notes sorted by date', async () => {
      const mockFiles = [
        { path: '/test/workspace/Daily Notes/2024-03-15.md', name: '2024-03-15.md', isDirectory: false },
        { path: '/test/workspace/Daily Notes/2024-03-14.md', name: '2024-03-14.md', isDirectory: false },
        { path: '/test/workspace/Daily Notes/2024-03-16.md', name: '2024-03-16.md', isDirectory: false },
      ];

      (invoke as any).mockResolvedValue(mockFiles);
      
      const notes = await dailyNotesService.getAllDailyNotes(mockWorkspacePath);
      
      expect(notes).toHaveLength(3);
      expect(notes[0].date > notes[1].date).toBe(true);
      expect(notes[1].date > notes[2].date).toBe(true);
    });

    it('should handle empty folder', async () => {
      (invoke as any).mockResolvedValue([]);
      
      const notes = await dailyNotesService.getAllDailyNotes(mockWorkspacePath);
      
      expect(notes).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      (invoke as any).mockRejectedValue(new Error('Folder not found'));
      
      const notes = await dailyNotesService.getAllDailyNotes(mockWorkspacePath);
      
      expect(notes).toHaveLength(0);
    });
  });
});
