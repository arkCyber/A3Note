/**
 * History Manager - Aerospace-grade undo/redo system
 */

import { Events } from '../plugins/api/Events';
import { log } from '../utils/logger';

export interface HistoryEntry {
  id: string;
  path: string;
  content: string;
  timestamp: number;
  cursorPosition?: { line: number; ch: number };
}

export interface HistoryOptions {
  maxHistorySize: number;
  mergeInterval: number; // milliseconds
}

/**
 * History Manager for undo/redo
 */
export class HistoryManager extends Events {
  private options: HistoryOptions;
  private histories: Map<string, HistoryEntry[]> = new Map();
  private currentIndex: Map<string, number> = new Map();
  private lastChangeTime: Map<string, number> = new Map();

  constructor(options: Partial<HistoryOptions> = {}) {
    super();
    this.options = {
      maxHistorySize: options.maxHistorySize || 100,
      mergeInterval: options.mergeInterval || 1000, // 1 second
    };
  }

  /**
   * Record a change
   */
  record(
    path: string,
    content: string,
    cursorPosition?: { line: number; ch: number }
  ): void {
    const now = Date.now();
    const lastChange = this.lastChangeTime.get(path) || 0;
    const timeSinceLastChange = now - lastChange;

    // Get or create history for this file
    if (!this.histories.has(path)) {
      this.histories.set(path, []);
      this.currentIndex.set(path, -1);
    }

    const history = this.histories.get(path)!;
    const currentIdx = this.currentIndex.get(path)!;

    // Check if we should merge with previous entry
    if (
      timeSinceLastChange < this.options.mergeInterval &&
      currentIdx >= 0 &&
      history[currentIdx]
    ) {
      // Update existing entry
      history[currentIdx] = {
        ...history[currentIdx],
        content,
        timestamp: now,
        cursorPosition,
      };
    } else {
      // Remove any entries after current index (when recording after undo)
      if (currentIdx < history.length - 1) {
        history.splice(currentIdx + 1);
      }

      // Add new entry
      const entry: HistoryEntry = {
        id: this.generateId(),
        path,
        content,
        timestamp: now,
        cursorPosition,
      };

      history.push(entry);

      // Limit history size
      if (history.length > this.options.maxHistorySize) {
        history.shift();
      } else {
        this.currentIndex.set(path, currentIdx + 1);
      }
    }

    this.lastChangeTime.set(path, now);
    this.trigger('record', path);
  }

  /**
   * Undo last change
   */
  undo(path: string): HistoryEntry | null {
    const history = this.histories.get(path);
    if (!history || history.length === 0) {
      return null;
    }

    const currentIdx = this.currentIndex.get(path)!;
    if (currentIdx <= 0) {
      return null; // Nothing to undo
    }

    const newIdx = currentIdx - 1;
    this.currentIndex.set(path, newIdx);

    const entry = history[newIdx];
    this.trigger('undo', path, entry);
    log.debug('HistoryManager', `Undo: ${path} to index ${newIdx}`);

    return entry;
  }

  /**
   * Redo last undone change
   */
  redo(path: string): HistoryEntry | null {
    const history = this.histories.get(path);
    if (!history || history.length === 0) {
      return null;
    }

    const currentIdx = this.currentIndex.get(path)!;
    if (currentIdx >= history.length - 1) {
      return null; // Nothing to redo
    }

    const newIdx = currentIdx + 1;
    this.currentIndex.set(path, newIdx);

    const entry = history[newIdx];
    this.trigger('redo', path, entry);
    log.debug('HistoryManager', `Redo: ${path} to index ${newIdx}`);

    return entry;
  }

  /**
   * Check if undo is available
   */
  canUndo(path: string): boolean {
    const history = this.histories.get(path);
    if (!history || history.length === 0) {
      return false;
    }

    const currentIdx = this.currentIndex.get(path)!;
    return currentIdx > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(path: string): boolean {
    const history = this.histories.get(path);
    if (!history || history.length === 0) {
      return false;
    }

    const currentIdx = this.currentIndex.get(path)!;
    return currentIdx < history.length - 1;
  }

  /**
   * Get history for a file
   */
  getHistory(path: string): HistoryEntry[] {
    return this.histories.get(path) || [];
  }

  /**
   * Get current entry
   */
  getCurrent(path: string): HistoryEntry | null {
    const history = this.histories.get(path);
    if (!history || history.length === 0) {
      return null;
    }

    const currentIdx = this.currentIndex.get(path)!;
    return history[currentIdx] || null;
  }

  /**
   * Get history size
   */
  getHistorySize(path: string): number {
    const history = this.histories.get(path);
    return history ? history.length : 0;
  }

  /**
   * Get current index
   */
  getCurrentIndex(path: string): number {
    return this.currentIndex.get(path) || -1;
  }

  /**
   * Clear history for a file
   */
  clear(path: string): void {
    this.histories.delete(path);
    this.currentIndex.delete(path);
    this.lastChangeTime.delete(path);
    this.trigger('clear', path);
  }

  /**
   * Clear all histories
   */
  clearAll(): void {
    this.histories.clear();
    this.currentIndex.clear();
    this.lastChangeTime.clear();
    this.trigger('clear-all');
  }

  /**
   * Jump to specific entry
   */
  jumpTo(path: string, index: number): HistoryEntry | null {
    const history = this.histories.get(path);
    if (!history || index < 0 || index >= history.length) {
      return null;
    }

    this.currentIndex.set(path, index);
    const entry = history[index];
    this.trigger('jump', path, entry);

    return entry;
  }

  /**
   * Get history timeline
   */
  getTimeline(path: string): Array<{ index: number; timestamp: number; isCurrent: boolean }> {
    const history = this.histories.get(path);
    if (!history) {
      return [];
    }

    const currentIdx = this.currentIndex.get(path)!;
    return history.map((entry, index) => ({
      index,
      timestamp: entry.timestamp,
      isCurrent: index === currentIdx,
    }));
  }

  /**
   * Export history
   */
  export(path: string): string {
    const history = this.histories.get(path);
    const currentIdx = this.currentIndex.get(path);

    return JSON.stringify({
      path,
      currentIndex: currentIdx,
      history,
    }, null, 2);
  }

  /**
   * Import history
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      const { path, currentIndex, history } = parsed;

      this.histories.set(path, history);
      this.currentIndex.set(path, currentIndex);
      this.trigger('import', path);
    } catch (error) {
      log.error('HistoryManager', 'Failed to import history', error as Error);
      throw new Error('Invalid history data');
    }
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    let total = 0;
    for (const history of this.histories.values()) {
      for (const entry of history) {
        total += entry.content.length;
      }
    }
    return total;
  }

  /**
   * Optimize memory by removing old entries
   */
  optimize(): void {
    for (const [path, history] of this.histories) {
      if (history.length > this.options.maxHistorySize) {
        const currentIdx = this.currentIndex.get(path)!;
        const toRemove = history.length - this.options.maxHistorySize;
        
        if (currentIdx >= toRemove) {
          history.splice(0, toRemove);
          this.currentIndex.set(path, currentIdx - toRemove);
        }
      }
    }
    this.trigger('optimize');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<HistoryOptions>): void {
    this.options = { ...this.options, ...options };
    this.trigger('options-updated', this.options);
  }

  /**
   * Get current options
   */
  getOptions(): HistoryOptions {
    return { ...this.options };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clearAll();
    this.removeAllListeners();
  }
}

/**
 * Singleton instance
 */
let historyInstance: HistoryManager | null = null;

export function getHistoryManager(): HistoryManager {
  if (!historyInstance) {
    historyInstance = new HistoryManager();
  }
  return historyInstance;
}

export function resetHistoryManager(): void {
  if (historyInstance) {
    historyInstance.destroy();
  }
  historyInstance = null;
}
