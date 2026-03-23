/**
 * useSettings Hook
 * Manages application settings with localStorage persistence
 */

import { useState, useEffect } from 'react';
import { log } from '../utils/logger';

export interface AppSettings {
  // 基础编辑器
  fontSize: number;
  autoSave: boolean;
  autoSaveDelay: number;
  spellCheck: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  tabSize: number;
  
  // 高级编辑器
  vimMode: boolean;
  defaultViewMode: 'source' | 'live-preview' | 'reading';
  showFrontmatter: boolean;
  showIndentGuides: boolean;
  strictLineBreaks: boolean;
  smartIndentLists: boolean;
  foldHeading: boolean;
  foldIndent: boolean;
  autoPairBrackets: boolean;
  autoPairMarkdown: boolean;
  
  // Properties (前置属性)
  showProperties: boolean;
  defaultPropertiesView: 'source' | 'table' | 'hidden';
  propertiesPosition: 'top' | 'bottom';
  
  // 文件与链接
  confirmFileDelete: boolean;
  deleteToTrash: boolean;
  newNoteLocation: 'root' | 'current' | 'folder';
  newNoteFolderPath: string;
  attachmentLocation: 'root' | 'current' | 'folder';
  attachmentFolderPath: string;
  autoUpdateLinks: boolean;
  useWikiLinks: boolean;
  detectAllExtensions: boolean;
  excludedFiles: string[];
  
  // 外观
  baseTheme: 'dark' | 'light' | 'system';
  showInlineTitle: boolean;
  showTabTitleBar: boolean;
  nativeMenus: boolean;
  
  // 字体
  textFont: string;
  monospaceFont: string;
  interfaceZoom: number;
  quickFontSizeAdjust: boolean;
  
  // CSS
  enabledCSSSnippets: string[];
  customCSS: string;
  
  // 高级外观
  stackTabs: boolean;
  translucentWindow: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  // 基础编辑器
  fontSize: 14,
  autoSave: true,
  autoSaveDelay: 2000,
  spellCheck: true,
  lineNumbers: true,
  wordWrap: true,
  tabSize: 2,
  
  // 高级编辑器
  vimMode: false,
  defaultViewMode: 'live-preview',
  showFrontmatter: true,
  showIndentGuides: false,
  strictLineBreaks: false,
  smartIndentLists: true,
  foldHeading: true,
  foldIndent: true,
  autoPairBrackets: true,
  autoPairMarkdown: true,
  
  // Properties
  showProperties: true,
  defaultPropertiesView: 'source',
  propertiesPosition: 'top',
  
  // 文件与链接
  confirmFileDelete: true,
  deleteToTrash: true,
  newNoteLocation: 'root',
  newNoteFolderPath: '',
  attachmentLocation: 'folder',
  attachmentFolderPath: 'attachments',
  autoUpdateLinks: true,
  useWikiLinks: true,
  detectAllExtensions: false,
  excludedFiles: [],
  
  // 外观
  baseTheme: 'dark',
  showInlineTitle: true,
  showTabTitleBar: true,
  nativeMenus: false,
  
  // 字体
  textFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  monospaceFont: '"Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
  interfaceZoom: 100,
  quickFontSizeAdjust: true,
  
  // CSS
  enabledCSSSnippets: [],
  customCSS: '',
  
  // 高级外观
  stackTabs: false,
  translucentWindow: false,
};

const SETTINGS_KEY = 'appSettings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        log.info('[useSettings] Loaded settings from localStorage');
      }
    } catch (error) {
      log.error('[useSettings] Failed to load settings:', error);
    }
  }, []);

  // Listen to settings changes from other components
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: updated }));
      log.info('[useSettings] Settings updated:', newSettings);
    } catch (error) {
      log.error('[useSettings] Failed to save settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: DEFAULT_SETTINGS }));
      log.info('[useSettings] Settings reset to defaults');
    } catch (error) {
      log.error('[useSettings] Failed to reset settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
