/**
 * Auto Save Service - Aerospace-grade auto-save functionality
 */

import { Events } from '../plugins/api/Events';
import { log } from '../utils/logger';

export interface AutoSaveOptions {
  interval: number; // milliseconds
  debounce: number; // milliseconds
  enabled: boolean;
}

export interface SaveCallback {
  (content: string, path: string): Promise<void>;
}

/**
 * Auto Save Manager
 */
export class AutoSaveManager extends Events {
  private options: AutoSaveOptions;
  private saveCallback: SaveCallback | null = null;
  private timers: Map<string, number> = new Map();
  private pendingChanges: Map<string, string> = new Map();
  private lastSaveTime: Map<string, number> = new Map();
  private saveInProgress: Set<string> = new Set();

  constructor(options: Partial<AutoSaveOptions> = {}) {
    super();
    this.options = {
      interval: options.interval || 30000, // 30 seconds
      debounce: options.debounce || 2000, // 2 seconds
      enabled: options.enabled !== false,
    };
  }

  /**
   * Set save callback
   */
  setSaveCallback(callback: SaveCallback): void {
    this.saveCallback = callback;
  }

  /**
   * Enable auto-save
   */
  enable(): void {
    this.options.enabled = true;
    this.trigger('enabled');
    log.info('AutoSave', 'Auto-save enabled');
  }

  /**
   * Disable auto-save
   */
  disable(): void {
    this.options.enabled = false;
    this.clearAllTimers();
    this.trigger('disabled');
    log.info('AutoSave', 'Auto-save disabled');
  }

  /**
   * Check if auto-save is enabled
   */
  isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Register content change
   */
  onChange(path: string, content: string): void {
    if (!this.options.enabled) {
      return;
    }

    // Store pending change
    this.pendingChanges.set(path, content);

    // Clear existing timer
    const existingTimer = this.timers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set debounced save timer
    const timer = window.setTimeout(() => {
      this.save(path);
    }, this.options.debounce);

    this.timers.set(path, timer);
  }

  /**
   * Force save immediately
   */
  async forceSave(path: string): Promise<void> {
    const timer = this.timers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(path);
    }

    await this.save(path);
  }

  /**
   * Save all pending changes
   */
  async saveAll(): Promise<void> {
    const paths = Array.from(this.pendingChanges.keys());
    const promises = paths.map(path => this.forceSave(path));
    await Promise.all(promises);
  }

  /**
   * Perform save operation
   */
  private async save(path: string): Promise<void> {
    if (!this.saveCallback) {
      log.warn('AutoSave', 'No save callback registered');
      return;
    }

    const content = this.pendingChanges.get(path);
    if (!content) {
      return;
    }

    // Check if save is already in progress
    if (this.saveInProgress.has(path)) {
      log.debug('AutoSave', `Save already in progress for ${path}`);
      return;
    }

    // Check minimum interval
    const lastSave = this.lastSaveTime.get(path) || 0;
    const timeSinceLastSave = Date.now() - lastSave;
    if (timeSinceLastSave < this.options.debounce) {
      log.debug('AutoSave', `Too soon to save ${path}, waiting...`);
      return;
    }

    try {
      this.saveInProgress.add(path);
      this.trigger('save-start', path);

      await this.saveCallback(content, path);

      this.pendingChanges.delete(path);
      this.lastSaveTime.set(path, Date.now());
      this.trigger('save-success', path);

      log.info('AutoSave', `Auto-saved: ${path}`);
    } catch (error) {
      this.trigger('save-error', path, error);
      log.error('AutoSave', `Failed to auto-save ${path}`, error as Error);
    } finally {
      this.saveInProgress.delete(path);
    }
  }

  /**
   * Get pending changes count
   */
  getPendingCount(): number {
    return this.pendingChanges.size;
  }

  /**
   * Check if file has pending changes
   */
  hasPendingChanges(path: string): boolean {
    return this.pendingChanges.has(path);
  }

  /**
   * Get all files with pending changes
   */
  getPendingFiles(): string[] {
    return Array.from(this.pendingChanges.keys());
  }

  /**
   * Clear pending changes for a file
   */
  clearPending(path: string): void {
    this.pendingChanges.delete(path);
    const timer = this.timers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(path);
    }
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<AutoSaveOptions>): void {
    this.options = { ...this.options, ...options };
    this.trigger('options-updated', this.options);
  }

  /**
   * Get current options
   */
  getOptions(): AutoSaveOptions {
    return { ...this.options };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clearAllTimers();
    this.pendingChanges.clear();
    this.lastSaveTime.clear();
    this.saveInProgress.clear();
    this.removeAllListeners();
  }
}

/**
 * Singleton instance
 */
let autoSaveInstance: AutoSaveManager | null = null;

export function getAutoSaveManager(): AutoSaveManager {
  if (!autoSaveInstance) {
    autoSaveInstance = new AutoSaveManager();
  }
  return autoSaveInstance;
}

export function resetAutoSaveManager(): void {
  if (autoSaveInstance) {
    autoSaveInstance.destroy();
  }
  autoSaveInstance = null;
}
