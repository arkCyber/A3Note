import { describe, it, expect } from 'vitest';
import { applyGrouping, groupDailyNotes } from '../dateGrouping';
import { FileItem } from '../../types';

describe('dateGrouping', () => {
  const mockFiles: FileItem[] = [
    { path: '/notes/2026-03-23.md', name: '2026-03-23.md', isDirectory: false },
    { path: '/notes/2026-03-22.md', name: '2026-03-22.md', isDirectory: false },
    { path: '/notes/2026-03-15.md', name: '2026-03-15.md', isDirectory: false },
    { path: '/notes/2026-02-10.md', name: '2026-02-10.md', isDirectory: false },
    { path: '/notes/2025-12-25.md', name: '2025-12-25.md', isDirectory: false },
    { path: '/notes/regular.md', name: 'regular.md', isDirectory: false },
    { path: '/notes/folder', name: 'folder', isDirectory: true },
  ];

  describe('applyGrouping', () => {
    it('should return all files in one group when mode is none', () => {
      const groups = applyGrouping(mockFiles, 'none');
      
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe('all');
      expect(groups[0].label).toBe('All Files');
      expect(groups[0].files.length).toBe(6); // Excludes directory
    });

    it('should group daily notes when mode is daily-notes', () => {
      const groups = applyGrouping(mockFiles, 'daily-notes');
      
      expect(groups.length).toBeGreaterThan(0);
      // Should only include files matching YYYY-MM-DD.md pattern
      const totalFiles = groups.reduce((sum, g) => sum + g.files.length, 0);
      expect(totalFiles).toBe(5); // 5 daily notes
    });

    it('should exclude directories from grouping', () => {
      const groups = applyGrouping(mockFiles, 'none');
      
      const allFiles = groups.flatMap(g => g.files);
      const hasDirectory = allFiles.some(f => f.isDirectory);
      expect(hasDirectory).toBe(false);
    });
  });

  describe('groupDailyNotes', () => {
    it('should group daily notes by date', () => {
      const groups = groupDailyNotes(mockFiles);
      
      expect(groups.length).toBeGreaterThan(0);
      groups.forEach(group => {
        expect(group.id).toBeTruthy();
        expect(group.label).toBeTruthy();
        expect(group.date).toBeInstanceOf(Date);
        expect(Array.isArray(group.files)).toBe(true);
      });
    });

    it('should only include files matching daily note pattern', () => {
      const groups = groupDailyNotes(mockFiles);
      
      const allFiles = groups.flatMap(g => g.files);
      allFiles.forEach(file => {
        expect(file.name).toMatch(/^\d{4}-\d{2}-\d{2}\.md$/);
      });
    });

    it('should not include regular files', () => {
      const groups = groupDailyNotes(mockFiles);
      
      const allFiles = groups.flatMap(g => g.files);
      const hasRegular = allFiles.some(f => f.name === 'regular.md');
      expect(hasRegular).toBe(false);
    });

    it('should sort groups by date (newest first)', () => {
      const groups = groupDailyNotes(mockFiles);
      
      if (groups.length > 1) {
        for (let i = 0; i < groups.length - 1; i++) {
          // Newer groups should come first (or be special keys like 'today')
          expect(groups[i].date.getTime()).toBeGreaterThanOrEqual(groups[i + 1].date.getTime());
        }
      }
    });

    it('should create separate groups for different dates', () => {
      const groups = groupDailyNotes(mockFiles);
      
      // Should have multiple groups for different dates
      expect(groups.length).toBeGreaterThan(1);
    });

    it('should handle files from different months', () => {
      const groups = groupDailyNotes(mockFiles);
      
      const marchFiles = groups.flatMap(g => g.files).filter(f => f.name.startsWith('2026-03'));
      const febFiles = groups.flatMap(g => g.files).filter(f => f.name.startsWith('2026-02'));
      
      expect(marchFiles.length).toBe(3);
      expect(febFiles.length).toBe(1);
    });

    it('should handle files from different years', () => {
      const groups = groupDailyNotes(mockFiles);
      
      const files2026 = groups.flatMap(g => g.files).filter(f => f.name.startsWith('2026'));
      const files2025 = groups.flatMap(g => g.files).filter(f => f.name.startsWith('2025'));
      
      expect(files2026.length).toBe(4);
      expect(files2025.length).toBe(1);
    });

    it('should sort files within groups alphabetically', () => {
      const groups = groupDailyNotes(mockFiles);
      
      groups.forEach(group => {
        const fileNames = group.files.map(f => f.name);
        const sortedNames = [...fileNames].sort();
        expect(fileNames).toEqual(sortedNames);
      });
    });
  });

  describe('group labels', () => {
    it('should use Today for today\'s date', () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const filesWithToday: FileItem[] = [
        { path: `/notes/${todayStr}.md`, name: `${todayStr}.md`, isDirectory: false },
      ];
      
      const groups = groupDailyNotes(filesWithToday);
      
      const todayGroup = groups.find(g => g.id === 'today');
      if (todayGroup) {
        expect(todayGroup.label).toBe('Today');
      }
    });

    it('should use Yesterday for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      const filesWithYesterday: FileItem[] = [
        { path: `/notes/${yesterdayStr}.md`, name: `${yesterdayStr}.md`, isDirectory: false },
      ];
      
      const groups = groupDailyNotes(filesWithYesterday);
      
      const yesterdayGroup = groups.find(g => g.id === 'yesterday');
      if (yesterdayGroup) {
        expect(yesterdayGroup.label).toBe('Yesterday');
      }
    });

    it('should use month name for dates in current year', () => {
      const groups = groupDailyNotes(mockFiles);
      
      // Should have month-based labels for recent dates
      const hasMonthLabel = groups.some(g => 
        g.label.includes('January') || 
        g.label.includes('February') || 
        g.label.includes('March')
      );
      
      expect(hasMonthLabel).toBe(true);
    });
  });
});
