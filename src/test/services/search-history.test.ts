/**
 * Search History Service Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchHistoryService } from '../../services/SearchHistoryService';

describe('SearchHistoryService', () => {
  let service: SearchHistoryService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as any;

    service = new SearchHistoryService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Add Search', () => {
    it('should add a search query to history', () => {
      service.addSearch('test query');

      const history = service.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('test query');
    });

    it('should add search with results count', () => {
      service.addSearch('test query', 42);

      const history = service.getHistory();
      expect(history[0].resultsCount).toBe(42);
    });

    it('should add search with filters', () => {
      const filters = { caseSensitive: true, regex: false };
      service.addSearch('test query', 10, filters);

      const history = service.getHistory();
      expect(history[0].filters).toEqual(filters);
    });

    it('should not add empty queries', () => {
      service.addSearch('');
      service.addSearch('   ');

      const history = service.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should add timestamp to entries', () => {
      const before = Date.now();
      service.addSearch('test query');
      const after = Date.now();

      const history = service.getHistory();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should deduplicate recent searches by default', () => {
      service.addSearch('test query');
      service.addSearch('other query');
      service.addSearch('test query'); // Duplicate

      const history = service.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].query).toBe('test query'); // Most recent
    });

    it('should respect max entries limit', () => {
      const smallService = new SearchHistoryService({ maxEntries: 5 });

      for (let i = 0; i < 10; i++) {
        smallService.addSearch(`query ${i}`);
      }

      const history = smallService.getHistory();
      expect(history).toHaveLength(5);
    });

    it('should persist to localStorage', () => {
      service.addSearch('test query');

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Get History', () => {
    beforeEach(() => {
      service.addSearch('query 1');
      service.addSearch('query 2');
      service.addSearch('query 3');
    });

    it('should return all history entries', () => {
      const history = service.getHistory();
      expect(history).toHaveLength(3);
    });

    it('should return copy of history array', () => {
      const history1 = service.getHistory();
      const history2 = service.getHistory();

      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });

    it('should return most recent first', () => {
      const history = service.getHistory();
      expect(history[0].query).toBe('query 3');
      expect(history[2].query).toBe('query 1');
    });
  });

  describe('Get Recent', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        service.addSearch(`query ${i}`);
      }
    });

    it('should return default 10 recent searches', () => {
      const recent = service.getRecent();
      expect(recent).toHaveLength(10);
    });

    it('should return specified number of recent searches', () => {
      const recent = service.getRecent(5);
      expect(recent).toHaveLength(5);
    });

    it('should return most recent first', () => {
      const recent = service.getRecent(3);
      expect(recent[0].query).toBe('query 19');
      expect(recent[2].query).toBe('query 17');
    });

    it('should handle request for more than available', () => {
      const recent = service.getRecent(100);
      expect(recent).toHaveLength(20);
    });
  });

  describe('Search History', () => {
    beforeEach(() => {
      service.addSearch('javascript tutorial');
      service.addSearch('python guide');
      service.addSearch('javascript advanced');
      service.addSearch('typescript basics');
    });

    it('should find matching queries', () => {
      const results = service.searchHistory('javascript');
      expect(results).toHaveLength(2);
    });

    it('should be case-insensitive', () => {
      const results = service.searchHistory('JAVASCRIPT');
      expect(results).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const results = service.searchHistory('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should match partial queries', () => {
      const results = service.searchHistory('script');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Most Frequent', () => {
    beforeEach(() => {
      service.addSearch('query A');
      service.addSearch('query B');
      service.addSearch('query A');
      service.addSearch('query C');
      service.addSearch('query A');
      service.addSearch('query B');
    });

    it('should return most frequent queries', () => {
      const frequent = service.getMostFrequent();
      expect(frequent[0].query).toBe('query A');
      expect(frequent[0].frequency).toBe(3);
    });

    it('should limit results to specified count', () => {
      const frequent = service.getMostFrequent(2);
      expect(frequent).toHaveLength(2);
    });

    it('should sort by frequency descending', () => {
      const frequent = service.getMostFrequent();
      expect(frequent[0].frequency).toBeGreaterThanOrEqual(frequent[1].frequency);
    });
  });

  describe('Clear History', () => {
    beforeEach(() => {
      service.addSearch('query 1');
      service.addSearch('query 2');
    });

    it('should clear all history', () => {
      service.clearHistory();

      const history = service.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should persist clear to localStorage', () => {
      service.clearHistory();

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Remove Entry', () => {
    beforeEach(() => {
      service.addSearch('query 1');
      service.addSearch('query 2');
      service.addSearch('query 3');
    });

    it('should remove specific entry', () => {
      service.removeEntry('query 2');

      const history = service.getHistory();
      expect(history).toHaveLength(2);
      expect(history.some(e => e.query === 'query 2')).toBe(false);
    });

    it('should not affect other entries', () => {
      service.removeEntry('query 2');

      const history = service.getHistory();
      expect(history.some(e => e.query === 'query 1')).toBe(true);
      expect(history.some(e => e.query === 'query 3')).toBe(true);
    });

    it('should persist removal to localStorage', () => {
      service.removeEntry('query 2');

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Remove Older Than', () => {
    it('should remove entries older than specified days', () => {
      const now = Date.now();
      
      // Mock old entries
      localStorageMock['a3note_search_history'] = JSON.stringify([
        { query: 'old', timestamp: now - 10 * 24 * 60 * 60 * 1000 },
        { query: 'recent', timestamp: now - 1 * 24 * 60 * 60 * 1000 },
      ]);

      service = new SearchHistoryService();
      service.removeOlderThan(7);

      const history = service.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('recent');
    });

    it('should keep all entries if none are old enough', () => {
      service.addSearch('query 1');
      service.addSearch('query 2');

      service.removeOlderThan(30);

      const history = service.getHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      service.addSearch('query A', 10);
      service.addSearch('query B', 20);
      service.addSearch('query A', 15);
    });

    it('should calculate total searches', () => {
      const stats = service.getStatistics();
      expect(stats.totalSearches).toBe(3);
    });

    it('should calculate unique queries', () => {
      const stats = service.getStatistics();
      expect(stats.uniqueQueries).toBe(2);
    });

    it('should calculate average results count', () => {
      const stats = service.getStatistics();
      expect(stats.averageResultsCount).toBe(15);
    });

    it('should track oldest and newest searches', () => {
      const stats = service.getStatistics();
      expect(stats.oldestSearch).toBeLessThan(stats.newestSearch!);
    });

    it('should handle empty history', () => {
      service.clearHistory();
      const stats = service.getStatistics();

      expect(stats.totalSearches).toBe(0);
      expect(stats.uniqueQueries).toBe(0);
      expect(stats.oldestSearch).toBeNull();
      expect(stats.newestSearch).toBeNull();
    });
  });

  describe('Export and Import', () => {
    beforeEach(() => {
      service.addSearch('query 1', 10);
      service.addSearch('query 2', 20);
    });

    it('should export history as JSON', () => {
      const exported = service.exportHistory();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('should import history from JSON', () => {
      const exported = service.exportHistory();
      
      const newService = new SearchHistoryService();
      const success = newService.importHistory(exported);

      expect(success).toBe(true);
      expect(newService.getHistory()).toHaveLength(2);
    });

    it('should reject invalid JSON', () => {
      const success = service.importHistory('invalid json');
      expect(success).toBe(false);
    });

    it('should reject non-array JSON', () => {
      const success = service.importHistory('{"key": "value"}');
      expect(success).toBe(false);
    });
  });

  describe('Suggestions', () => {
    beforeEach(() => {
      service.addSearch('javascript tutorial');
      service.addSearch('javascript advanced');
      service.addSearch('python guide');
      service.addSearch('typescript basics');
    });

    it('should return suggestions for partial query', () => {
      const suggestions = service.getSuggestions('java');
      expect(suggestions).toHaveLength(2);
      expect(suggestions.every(s => s.startsWith('java'))).toBe(true);
    });

    it('should limit suggestions to max count', () => {
      const suggestions = service.getSuggestions('', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return recent searches for empty query', () => {
      const suggestions = service.getSuggestions('');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should remove duplicate suggestions', () => {
      service.addSearch('javascript tutorial'); // Duplicate
      
      const suggestions = service.getSuggestions('java');
      const unique = new Set(suggestions);
      expect(suggestions.length).toBe(unique.size);
    });

    it('should be case-insensitive', () => {
      const suggestions = service.getSuggestions('JAVA');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Merge', () => {
    it('should merge with another history', () => {
      service.addSearch('query A');
      
      const otherHistory = [
        { query: 'query B', timestamp: Date.now() },
        { query: 'query C', timestamp: Date.now() },
      ];

      service.merge(otherHistory);

      const history = service.getHistory();
      expect(history).toHaveLength(3);
    });

    it('should remove duplicates keeping newest', () => {
      const oldTime = Date.now() - 1000;
      const newTime = Date.now();

      service.addSearch('query A');
      
      const otherHistory = [
        { query: 'query A', timestamp: newTime },
      ];

      service.merge(otherHistory);

      const history = service.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].timestamp).toBe(newTime);
    });

    it('should sort by timestamp after merge', () => {
      service.addSearch('query A');
      
      const otherHistory = [
        { query: 'query B', timestamp: Date.now() + 1000 },
      ];

      service.merge(otherHistory);

      const history = service.getHistory();
      expect(history[0].query).toBe('query B'); // Newest first
    });

    it('should respect max entries after merge', () => {
      const smallService = new SearchHistoryService({ maxEntries: 5 });
      
      for (let i = 0; i < 3; i++) {
        smallService.addSearch(`query ${i}`);
      }

      const otherHistory = [];
      for (let i = 3; i < 10; i++) {
        otherHistory.push({ query: `query ${i}`, timestamp: Date.now() });
      }

      smallService.merge(otherHistory);

      const history = smallService.getHistory();
      expect(history).toHaveLength(5);
    });
  });

  describe('Persistence', () => {
    it('should load history from localStorage on init', () => {
      const existingHistory = [
        { query: 'existing query', timestamp: Date.now() },
      ];
      localStorageMock['a3note_search_history'] = JSON.stringify(existingHistory);

      const newService = new SearchHistoryService();
      const history = newService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('existing query');
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock['a3note_search_history'] = 'corrupted data';

      const newService = new SearchHistoryService();
      const history = newService.getHistory();

      expect(history).toHaveLength(0);
    });

    it('should use custom storage key', () => {
      const customService = new SearchHistoryService({ storageKey: 'custom_key' });
      customService.addSearch('test');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'custom_key',
        expect.any(String)
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long queries', () => {
      const longQuery = 'a'.repeat(1000);
      service.addSearch(longQuery);

      const history = service.getHistory();
      expect(history[0].query).toBe(longQuery);
    });

    it('should handle special characters in queries', () => {
      const specialQuery = '!@#$%^&*()[]{}|\\;:\'",.<>?/`~';
      service.addSearch(specialQuery);

      const history = service.getHistory();
      expect(history[0].query).toBe(specialQuery);
    });

    it('should handle unicode characters', () => {
      const unicodeQuery = '你好世界 🌍 مرحبا';
      service.addSearch(unicodeQuery);

      const history = service.getHistory();
      expect(history[0].query).toBe(unicodeQuery);
    });

    it('should handle queries with only whitespace', () => {
      service.addSearch('   \t\n   ');

      const history = service.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should handle large history efficiently', () => {
      const largeService = new SearchHistoryService({ maxEntries: 1000 });

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        largeService.addSearch(`query ${i}`);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(500); // Should be fast
      expect(largeService.getHistory()).toHaveLength(1000);
    });

    it('should search large history efficiently', () => {
      const largeService = new SearchHistoryService({ maxEntries: 1000 });
      for (let i = 0; i < 1000; i++) {
        largeService.addSearch(`query ${i}`);
      }

      const start = performance.now();
      const results = largeService.searchHistory('500');
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should get suggestions efficiently', () => {
      for (let i = 0; i < 100; i++) {
        service.addSearch(`query ${i}`);
      }

      const start = performance.now();
      const suggestions = service.getSuggestions('query');
      const end = performance.now();

      expect(end - start).toBeLessThan(20);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
