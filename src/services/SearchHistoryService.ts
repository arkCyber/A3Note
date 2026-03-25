/**
 * Search History Service - Aerospace-grade search history management
 * Manages search query history with persistence
 */

export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
  resultsCount?: number;
  filters?: {
    caseSensitive?: boolean;
    regex?: boolean;
    fileType?: string;
  };
}

export interface SearchHistoryOptions {
  maxEntries?: number;
  storageKey?: string;
  deduplicateRecent?: boolean;
}

/**
 * Service for managing search history
 */
export class SearchHistoryService {
  private history: SearchHistoryEntry[] = [];
  private maxEntries: number;
  private storageKey: string;
  private deduplicateRecent: boolean;

  constructor(options: SearchHistoryOptions = {}) {
    this.maxEntries = options.maxEntries || 100;
    this.storageKey = options.storageKey || 'a3note_search_history';
    this.deduplicateRecent = options.deduplicateRecent !== false;

    this.loadHistory();
  }

  /**
   * Add a search query to history
   */
  addSearch(query: string, resultsCount?: number, filters?: SearchHistoryEntry['filters']): void {
    if (!query.trim()) {
      return;
    }

    // Remove duplicate if deduplication is enabled
    if (this.deduplicateRecent) {
      this.history = this.history.filter(entry => entry.query !== query);
    }

    // Add new entry at the beginning
    const entry: SearchHistoryEntry = {
      query,
      timestamp: Date.now(),
      resultsCount,
      filters,
    };

    this.history.unshift(entry);

    // Trim to max entries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    this.saveHistory();
  }

  /**
   * Get all history entries
   */
  getHistory(): SearchHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get recent searches (default: last 10)
   */
  getRecent(count: number = 10): SearchHistoryEntry[] {
    return this.history.slice(0, count);
  }

  /**
   * Search in history
   */
  searchHistory(query: string): SearchHistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(entry =>
      entry.query.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get most frequent searches
   */
  getMostFrequent(count: number = 10): Array<{ query: string; frequency: number }> {
    const frequency = new Map<string, number>();

    for (const entry of this.history) {
      const current = frequency.get(entry.query) || 0;
      frequency.set(entry.query, current + 1);
    }

    return Array.from(frequency.entries())
      .map(([query, freq]) => ({ query, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, count);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Remove a specific entry
   */
  removeEntry(query: string): void {
    this.history = this.history.filter(entry => entry.query !== query);
    this.saveHistory();
  }

  /**
   * Remove entries older than specified days
   */
  removeOlderThan(days: number): void {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    this.history = this.history.filter(entry => entry.timestamp > cutoffTime);
    this.saveHistory();
  }

  /**
   * Get history statistics
   */
  getStatistics(): {
    totalSearches: number;
    uniqueQueries: number;
    oldestSearch: number | null;
    newestSearch: number | null;
    averageResultsCount: number;
  } {
    const uniqueQueries = new Set(this.history.map(e => e.query)).size;
    const timestamps = this.history.map(e => e.timestamp);
    const resultsWithCount = this.history.filter(e => e.resultsCount !== undefined);
    const avgResults = resultsWithCount.length > 0
      ? resultsWithCount.reduce((sum, e) => sum + (e.resultsCount || 0), 0) / resultsWithCount.length
      : 0;

    return {
      totalSearches: this.history.length,
      uniqueQueries,
      oldestSearch: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestSearch: timestamps.length > 0 ? Math.max(...timestamps) : null,
      averageResultsCount: avgResults,
    };
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.history = imported;
        this.saveHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Get suggestions based on partial query
   */
  getSuggestions(partialQuery: string, maxSuggestions: number = 5): string[] {
    if (!partialQuery.trim()) {
      return this.getRecent(maxSuggestions).map(e => e.query);
    }

    const lowerQuery = partialQuery.toLowerCase();
    const suggestions = this.history
      .filter(entry => entry.query.toLowerCase().startsWith(lowerQuery))
      .map(entry => entry.query);

    // Remove duplicates while preserving order
    const unique = [...new Set(suggestions)];

    return unique.slice(0, maxSuggestions);
  }

  /**
   * Merge with another history
   */
  merge(otherHistory: SearchHistoryEntry[]): void {
    const combined = [...this.history, ...otherHistory];

    // Sort by timestamp (newest first)
    combined.sort((a, b) => b.timestamp - a.timestamp);

    // Remove duplicates (keep newest)
    const seen = new Set<string>();
    this.history = combined.filter(entry => {
      if (seen.has(entry.query)) {
        return false;
      }
      seen.add(entry.query);
      return true;
    });

    // Trim to max entries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    this.saveHistory();
  }
}

// Global instance
export const searchHistoryService = new SearchHistoryService();
