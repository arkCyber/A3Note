// Settings Service - Aerospace Grade
// Persistent settings management with local storage

import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../utils/logger';

export interface AISettings {
  ollamaUrl: string;
  embeddingModel: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  contextSize: number;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveDelay: number;
  enableFileWatcher: boolean;
  enableAutoIndex: boolean;
}

export interface Settings {
  ai: AISettings;
  editor: EditorSettings;
  app: AppSettings;
  version: string;
}

const DEFAULT_SETTINGS: Settings = {
  ai: {
    ollamaUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    llmModel: 'qwen2.5:14b',
    temperature: 0.7,
    maxTokens: 2048,
    contextSize: 4096,
  },
  editor: {
    fontSize: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    tabSize: 2,
    wordWrap: true,
    showLineNumbers: false,
  },
  app: {
    theme: 'dark',
    language: 'zh-CN',
    autoSave: true,
    autoSaveDelay: 2000,
    enableFileWatcher: true,
    enableAutoIndex: true,
  },
  version: '3.0.0',
};

/**
 * Settings Service
 * Manages application settings with persistence
 */
export class SettingsService {
  private static instance: SettingsService;
  private settings: Settings;
  private listeners: Set<(settings: Settings) => void> = new Set();

  private constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Load settings from storage
   */
  async load(): Promise<Settings> {
    try {
      log.info('[Settings] Loading settings from storage');

      // Try to load from Tauri backend
      const stored = await invoke<string>('read_file_content', {
        path: await this.getSettingsPath(),
      });

      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = this.mergeWithDefaults(parsed);
        log.info('[Settings] Settings loaded successfully');
      } else {
        log.info('[Settings] No stored settings found, using defaults');
        this.settings = { ...DEFAULT_SETTINGS };
      }
    } catch (error) {
      log.warn('[Settings] Failed to load settings, using defaults:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }

    return this.settings;
  }

  /**
   * Save settings to storage
   */
  async save(settings?: Partial<Settings>): Promise<void> {
    try {
      if (settings) {
        this.settings = this.mergeSettings(this.settings, settings);
      }

      log.info('[Settings] Saving settings to storage');

      const json = JSON.stringify(this.settings, null, 2);
      await invoke('write_file_content', {
        path: await this.getSettingsPath(),
        content: json,
      });

      log.info('[Settings] Settings saved successfully');

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      log.error('[Settings] Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Get current settings
   */
  get(): Settings {
    return { ...this.settings };
  }

  /**
   * Update AI settings
   */
  async updateAI(ai: Partial<AISettings>): Promise<void> {
    await this.save({
      ai: { ...this.settings.ai, ...ai },
    });
  }

  /**
   * Update editor settings
   */
  async updateEditor(editor: Partial<EditorSettings>): Promise<void> {
    await this.save({
      editor: { ...this.settings.editor, ...editor },
    });
  }

  /**
   * Update app settings
   */
  async updateApp(app: Partial<AppSettings>): Promise<void> {
    await this.save({
      app: { ...this.settings.app, ...app },
    });
  }

  /**
   * Reset to defaults
   */
  async reset(): Promise<void> {
    log.info('[Settings] Resetting to defaults');
    this.settings = { ...DEFAULT_SETTINGS };
    await this.save();
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: Settings) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get settings file path
   */
  private async getSettingsPath(): Promise<string> {
    try {
      // Try to get app config dir from Tauri
      const configDir = await invoke<string>('get_app_config_dir');
      return `${configDir}/settings.json`;
    } catch {
      // Fallback to user's home directory
      return '~/.a3note/settings.json';
    }
  }

  /**
   * Merge stored settings with defaults
   */
  private mergeWithDefaults(stored: Partial<Settings>): Settings {
    return {
      ai: { ...DEFAULT_SETTINGS.ai, ...stored.ai },
      editor: { ...DEFAULT_SETTINGS.editor, ...stored.editor },
      app: { ...DEFAULT_SETTINGS.app, ...stored.app },
      version: stored.version || DEFAULT_SETTINGS.version,
    };
  }

  /**
   * Merge settings
   */
  private mergeSettings(current: Settings, updates: Partial<Settings>): Settings {
    return {
      ai: updates.ai ? { ...current.ai, ...updates.ai } : current.ai,
      editor: updates.editor ? { ...current.editor, ...updates.editor } : current.editor,
      app: updates.app ? { ...current.app, ...updates.app } : current.app,
      version: updates.version || current.version,
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.settings);
      } catch (error) {
        log.error('[Settings] Error in listener:', error);
      }
    });
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
