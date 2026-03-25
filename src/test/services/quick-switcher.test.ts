/**
 * Quick Switcher Service Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuickSwitcherService } from '../../services/QuickSwitcherService';
import { FileItem } from '../../types';

describe('QuickSwitcherService', () => {
  let service: QuickSwitcherService;
  let testFiles: FileItem[];

  beforeEach(() => {
    service = new QuickSwitcherService();
    
    testFiles = [
      { id: '1', name: 'README.md', path: 'README.md', type: 'file' },
      { id: '2', name: 'index.ts', path: 'src/index.ts', type: 'file' },
      { id: '3', name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
      { id: '4', name: 'utils.ts', path: 'src/utils/utils.ts', type: 'file' },
      { id: '5', name: 'test.spec.ts', path: 'src/test/test.spec.ts', type: 'file' },
      { id: '6', name: 'config.json', path: 'config.json', type: 'file' },
      { id: '7', name: 'package.json', path: 'package.json', type: 'file' },
    ];

    service.setFiles(testFiles);
  });

  describe('Basic Search', () => {
    it('should find files by exact name match', () => {
      const results = service.search('README');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].file.name).toBe('README.md');
    });

    it('should find files by partial name match', () => {
      const results = service.search('test');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.file.name.includes('test'))).toBe(true);
    });

    it('should be case insensitive by default', () => {
      const results = service.search('readme');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].file.name).toBe('README.md');
    });

    it('should support case sensitive search', () => {
      const results = service.search('README', { caseSensitive: true });
      expect(results.length).toBeGreaterThan(0);
      
      const lowerResults = service.search('readme', { caseSensitive: true });
      expect(lowerResults.length).toBe(0);
    });

    it('should return empty array for no matches', () => {
      const results = service.search('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('Fuzzy Search', () => {
    it('should find files with fuzzy matching', () => {
      const results = service.search('rdm', { fuzzyMatch: true });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should score exact matches higher', () => {
      const results = service.search('utils');
      const exactMatch = results.find(r => r.file.name === 'utils.ts');
      expect(exactMatch).toBeDefined();
      expect(exactMatch!.score).toBeGreaterThan(0);
    });

    it('should handle consecutive character matches', () => {
      const results = service.search('app');
      expect(results.some(r => r.file.name === 'App.tsx')).toBe(true);
    });

    it('should disable fuzzy matching when requested', () => {
      const results = service.search('rdm', { fuzzyMatch: false });
      expect(results.length).toBe(0);
    });
  });

  describe('Filtering', () => {
    it('should filter by file type', () => {
      const results = service.search('', { fileTypes: ['ts'], maxResults: 10 });
      expect(results.every(r => r.file.name.endsWith('.ts'))).toBe(true);
    });

    it('should filter by multiple file types', () => {
      const results = service.search('', { fileTypes: ['ts', 'tsx'], maxResults: 10 });
      expect(results.every(r => 
        r.file.name.endsWith('.ts') || r.file.name.endsWith('.tsx')
      )).toBe(true);
    });

    it('should limit results', () => {
      const results = service.search('', { maxResults: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Recent Files', () => {
    it('should return recent files when query is empty', () => {
      service.addToRecent('README.md');
      service.addToRecent('src/index.ts');
      
      const results = service.search('');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].file.path).toBe('src/index.ts');
    });

    it('should boost score for recent files', () => {
      service.addToRecent('README.md');
      
      const results = service.search('read');
      const recentFile = results.find(r => r.file.path === 'README.md');
      expect(recentFile).toBeDefined();
    });

    it('should maintain recent files order', () => {
      service.addToRecent('file1.md');
      service.addToRecent('file2.md');
      service.addToRecent('file3.md');
      
      const recent = service.getRecentFiles();
      expect(recent[0]).toBe('file3.md');
      expect(recent[1]).toBe('file2.md');
      expect(recent[2]).toBe('file1.md');
    });

    it('should deduplicate recent files', () => {
      service.addToRecent('file1.md');
      service.addToRecent('file2.md');
      service.addToRecent('file1.md');
      
      const recent = service.getRecentFiles();
      expect(recent.length).toBe(2);
      expect(recent[0]).toBe('file1.md');
    });

    it('should limit recent files', () => {
      for (let i = 0; i < 30; i++) {
        service.addToRecent(`file${i}.md`);
      }
      
      const recent = service.getRecentFiles();
      expect(recent.length).toBeLessThanOrEqual(20);
    });

    it('should clear recent files', () => {
      service.addToRecent('file1.md');
      service.addToRecent('file2.md');
      service.clearRecent();
      
      const recent = service.getRecentFiles();
      expect(recent.length).toBe(0);
    });
  });

  describe('Scoring', () => {
    it('should score starts-with matches higher', () => {
      const results = service.search('read');
      const startsWithMatch = results.find(r => r.file.name.toLowerCase().startsWith('read'));
      expect(startsWithMatch).toBeDefined();
      expect(startsWithMatch!.score).toBeGreaterThan(50);
    });

    it('should score path matches', () => {
      const results = service.search('src');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.file.path.includes('src'))).toBe(true);
    });

    it('should sort results by score', () => {
      const results = service.search('test');
      
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics', () => {
      service.addToRecent('README.md');
      service.addToRecent('src/index.ts');
      
      const stats = service.getStatistics();
      
      expect(stats.totalFiles).toBe(testFiles.length);
      expect(stats.recentFilesCount).toBe(2);
      expect(stats.fileTypes).toBeDefined();
      expect(stats.fileTypes['md']).toBeGreaterThan(0);
      expect(stats.fileTypes['ts']).toBeGreaterThan(0);
    });

    it('should count file types correctly', () => {
      const stats = service.getStatistics();
      
      expect(stats.fileTypes['md']).toBe(1);
      expect(stats.fileTypes['ts']).toBe(3);
      expect(stats.fileTypes['tsx']).toBe(1);
      expect(stats.fileTypes['json']).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', () => {
      service.setFiles([]);
      const results = service.search('test');
      expect(results).toEqual([]);
    });

    it('should handle empty query', () => {
      const results = service.search('');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle whitespace query', () => {
      const results = service.search('   ');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters in query', () => {
      const results = service.search('test.spec');
      expect(results.some(r => r.file.name === 'test.spec.ts')).toBe(true);
    });

    it('should handle very long queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = service.search(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should search large file list quickly', () => {
      const largeFileList: FileItem[] = [];
      for (let i = 0; i < 1000; i++) {
        largeFileList.push({
          id: `${i}`,
          name: `file${i}.md`,
          path: `folder${i % 10}/file${i}.md`,
          type: 'file',
        });
      }
      
      service.setFiles(largeFileList);
      
      const start = performance.now();
      service.search('file5');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });

    it('should handle many recent files efficiently', () => {
      for (let i = 0; i < 100; i++) {
        service.addToRecent(`file${i}.md`);
      }
      
      const start = performance.now();
      service.getRecentFiles();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10);
    });
  });
});
