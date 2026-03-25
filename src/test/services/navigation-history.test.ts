/**
 * Navigation History Service Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationHistoryService } from '../../services/NavigationHistoryService';

describe('NavigationHistoryService', () => {
  let service: NavigationHistoryService;

  beforeEach(() => {
    service = new NavigationHistoryService();
  });

  describe('Basic Navigation', () => {
    it('should push navigation entries', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      
      expect(service.getSize()).toBe(2);
    });

    it('should navigate back', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      
      const entry = service.back();
      expect(entry?.filePath).toBe('file1.md');
    });

    it('should navigate forward', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.back();
      
      const entry = service.forward();
      expect(entry?.filePath).toBe('file2.md');
    });

    it('should return null when cannot go back', () => {
      service.push({ filePath: 'file1.md' });
      const entry = service.back();
      expect(entry).toBeNull();
    });

    it('should return null when cannot go forward', () => {
      service.push({ filePath: 'file1.md' });
      const entry = service.forward();
      expect(entry).toBeNull();
    });
  });

  describe('History Management', () => {
    it('should clear forward history when pushing after going back', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.push({ filePath: 'file3.md' });
      service.back();
      service.back();
      
      service.push({ filePath: 'file4.md' });
      
      expect(service.canGoForward()).toBe(false);
      expect(service.getSize()).toBe(3);
    });

    it('should maintain max history size', () => {
      const smallService = new NavigationHistoryService({ maxHistorySize: 5 });
      
      for (let i = 0; i < 10; i++) {
        smallService.push({ filePath: `file${i}.md` });
      }
      
      expect(smallService.getSize()).toBe(5);
    });

    it('should deduplicate consecutive entries', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file1.md' });
      
      expect(service.getSize()).toBe(1);
    });

    it('should not deduplicate non-consecutive entries', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.push({ filePath: 'file1.md' });
      
      expect(service.getSize()).toBe(3);
    });

    it('should disable deduplication when requested', () => {
      const noDedupService = new NavigationHistoryService({ 
        deduplicateConsecutive: false 
      });
      
      noDedupService.push({ filePath: 'file1.md' });
      noDedupService.push({ filePath: 'file1.md' });
      
      expect(noDedupService.getSize()).toBe(2);
    });
  });

  describe('Position Tracking', () => {
    it('should track cursor position', () => {
      service.push({ 
        filePath: 'file1.md',
        position: { line: 10, column: 5 }
      });
      
      const current = service.getCurrent();
      expect(current?.position).toEqual({ line: 10, column: 5 });
    });

    it('should consider same location with different positions as different', () => {
      service.push({ 
        filePath: 'file1.md',
        position: { line: 10, column: 5 }
      });
      service.push({ 
        filePath: 'file1.md',
        position: { line: 20, column: 10 }
      });
      
      expect(service.getSize()).toBe(2);
    });

    it('should consider same location without positions as same', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file1.md' });
      
      expect(service.getSize()).toBe(1);
    });
  });

  describe('History Queries', () => {
    beforeEach(() => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.push({ filePath: 'file3.md' });
      service.push({ filePath: 'file4.md' });
      service.back();
      service.back();
    });

    it('should get current entry', () => {
      const current = service.getCurrent();
      expect(current?.filePath).toBe('file2.md');
    });

    it('should get all history', () => {
      const history = service.getHistory();
      expect(history.length).toBe(4);
    });

    it('should get back history', () => {
      const backHistory = service.getBackHistory();
      expect(backHistory.length).toBe(2);
      expect(backHistory[0].filePath).toBe('file1.md');
    });

    it('should get forward history', () => {
      const forwardHistory = service.getForwardHistory();
      expect(forwardHistory.length).toBe(2);
      expect(forwardHistory[0].filePath).toBe('file3.md');
    });

    it('should check if can go back', () => {
      expect(service.canGoBack()).toBe(true);
    });

    it('should check if can go forward', () => {
      expect(service.canGoForward()).toBe(true);
    });
  });

  describe('Jump To', () => {
    beforeEach(() => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.push({ filePath: 'file3.md' });
    });

    it('should jump to specific index', () => {
      const entry = service.jumpTo(0);
      expect(entry?.filePath).toBe('file1.md');
      expect(service.getCurrentIndex()).toBe(0);
    });

    it('should return null for invalid index', () => {
      const entry = service.jumpTo(10);
      expect(entry).toBeNull();
    });

    it('should handle negative index', () => {
      const entry = service.jumpTo(-1);
      expect(entry).toBeNull();
    });
  });

  describe('Import/Export', () => {
    it('should export history to JSON', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      
      const json = service.export();
      expect(json).toBeTruthy();
      expect(typeof json).toBe('string');
    });

    it('should import history from JSON', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      
      const json = service.export();
      
      const newService = new NavigationHistoryService();
      const success = newService.import(json);
      
      expect(success).toBe(true);
      expect(newService.getSize()).toBe(2);
    });

    it('should reject invalid JSON', () => {
      const success = service.import('invalid json');
      expect(success).toBe(false);
    });

    it('should reject invalid structure', () => {
      const success = service.import('{"invalid": "structure"}');
      expect(success).toBe(false);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.push({ filePath: 'file1.md' });
      service.back();
    });

    it('should return correct statistics', () => {
      const stats = service.getStatistics();
      
      expect(stats.totalEntries).toBe(3);
      expect(stats.currentIndex).toBe(1);
      expect(stats.canGoBack).toBe(true);
      expect(stats.canGoForward).toBe(true);
      expect(stats.uniqueFiles).toBe(2);
    });

    it('should track timestamps', () => {
      const stats = service.getStatistics();
      
      expect(stats.oldestEntry).toBeDefined();
      expect(stats.newestEntry).toBeDefined();
      expect(stats.newestEntry!).toBeGreaterThanOrEqual(stats.oldestEntry!);
    });
  });

  describe('Clear', () => {
    it('should clear all history', () => {
      service.push({ filePath: 'file1.md' });
      service.push({ filePath: 'file2.md' });
      service.clear();
      
      expect(service.getSize()).toBe(0);
      expect(service.getCurrentIndex()).toBe(-1);
    });

    it('should reset navigation state after clear', () => {
      service.push({ filePath: 'file1.md' });
      service.clear();
      
      expect(service.canGoBack()).toBe(false);
      expect(service.canGoForward()).toBe(false);
      expect(service.getCurrent()).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle large history efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        service.push({ filePath: `file${i}.md` });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });

    it('should navigate efficiently in large history', () => {
      for (let i = 0; i < 100; i++) {
        service.push({ filePath: `file${i}.md` });
      }
      
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        service.back();
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50);
    });
  });
});
