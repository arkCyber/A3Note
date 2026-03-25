/**
 * Navigation History Service - Aerospace-grade implementation
 * DO-178C Level A
 * Manages navigation history for back/forward functionality
 */

export interface NavigationEntry {
  filePath: string;
  position?: {
    line: number;
    column: number;
  };
  timestamp: number;
}

export interface NavigationHistoryOptions {
  maxHistorySize?: number;
  deduplicateConsecutive?: boolean;
}

/**
 * Navigation History Service
 * Provides back/forward navigation capabilities
 */
export class NavigationHistoryService {
  private history: NavigationEntry[] = [];
  private currentIndex = -1;
  private maxHistorySize: number;
  private deduplicateConsecutive: boolean;

  constructor(options: NavigationHistoryOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.deduplicateConsecutive = options.deduplicateConsecutive !== false;
  }

  /**
   * Add a navigation entry
   */
  push(entry: Omit<NavigationEntry, 'timestamp'>): void {
    const newEntry: NavigationEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    // Check for consecutive duplicate
    if (this.deduplicateConsecutive && this.currentIndex >= 0) {
      const current = this.history[this.currentIndex];
      if (this.isSameLocation(current, newEntry)) {
        // Update timestamp but don't add new entry
        this.history[this.currentIndex] = newEntry;
        return;
      }
    }

    // Remove any entries after current index (when navigating after going back)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new entry
    this.history.push(newEntry);
    this.currentIndex++;

    // Trim history if exceeds max size
    if (this.history.length > this.maxHistorySize) {
      const removeCount = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(removeCount);
      this.currentIndex -= removeCount;
    }
  }

  /**
   * Navigate back
   */
  back(): NavigationEntry | null {
    if (!this.canGoBack()) {
      return null;
    }

    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /**
   * Navigate forward
   */
  forward(): NavigationEntry | null {
    if (!this.canGoForward()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if can go forward
   */
  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current entry
   */
  getCurrent(): NavigationEntry | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get all history entries
   */
  getHistory(): NavigationEntry[] {
    return [...this.history];
  }

  /**
   * Get back history (entries before current)
   */
  getBackHistory(): NavigationEntry[] {
    if (this.currentIndex <= 0) {
      return [];
    }
    return this.history.slice(0, this.currentIndex).reverse();
  }

  /**
   * Get forward history (entries after current)
   */
  getForwardHistory(): NavigationEntry[] {
    if (this.currentIndex >= this.history.length - 1) {
      return [];
    }
    return this.history.slice(this.currentIndex + 1);
  }

  /**
   * Jump to specific index
   */
  jumpTo(index: number): NavigationEntry | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }

    this.currentIndex = index;
    return this.history[this.currentIndex];
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get history size
   */
  getSize(): number {
    return this.history.length;
  }

  /**
   * Check if two locations are the same
   */
  private isSameLocation(a: NavigationEntry, b: NavigationEntry): boolean {
    if (a.filePath !== b.filePath) {
      return false;
    }

    // If both have positions, compare them
    if (a.position && b.position) {
      return a.position.line === b.position.line && 
             a.position.column === b.position.column;
    }

    // If neither has position, consider same
    if (!a.position && !b.position) {
      return true;
    }

    // One has position, one doesn't - consider different
    return false;
  }

  /**
   * Export history to JSON
   */
  export(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
    });
  }

  /**
   * Import history from JSON
   */
  import(json: string): boolean {
    try {
      const data = JSON.parse(json);
      
      if (!Array.isArray(data.history) || typeof data.currentIndex !== 'number') {
        return false;
      }

      this.history = data.history;
      this.currentIndex = data.currentIndex;
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    currentIndex: number;
    canGoBack: boolean;
    canGoForward: boolean;
    uniqueFiles: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const uniqueFiles = new Set(this.history.map(e => e.filePath)).size;
    const timestamps = this.history.map(e => e.timestamp);

    return {
      totalEntries: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
      uniqueFiles,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }
}

// Singleton instance
let navigationHistoryInstance: NavigationHistoryService | null = null;

export function getNavigationHistoryService(): NavigationHistoryService {
  if (!navigationHistoryInstance) {
    navigationHistoryInstance = new NavigationHistoryService();
  }
  return navigationHistoryInstance;
}
