/**
 * Plugin API Exports
 * Export all Obsidian-compatible APIs
 */

export { App, app, Commands } from './App';
export { Vault } from './Vault';
export type { TFile, TFolder } from './Vault';
export { Workspace } from './Workspace';
export type { WorkspaceLeaf } from './Workspace';
export { MetadataCache } from './MetadataCache';
export type {
  CachedMetadata,
  LinkCache,
  EmbedCache,
  TagCache,
  HeadingCache,
  SectionCache,
  ListItemCache,
  FrontMatterCache,
  BlockCache,
  Position,
} from './MetadataCache';

// Editor API
export { Editor } from './Editor';
export type { EditorPosition, EditorRange, EditorTransaction } from './Editor';

// Editor Extensions
export { EditorExtensions } from './EditorExtensions';

// Notice API
export { Notice, noticeSuccess, noticeError, noticeWarning, noticeInfo } from './Notice';
export type { NoticeOptions } from './Notice';

// Modal API
export { Modal, SuggestModal, FuzzySuggestModal } from './Modal';
export type { ModalOptions } from './Modal';

// Events System
export { Events, Component, EventEmitter } from './Events';
export type { EventCallback, EventRef } from './Events';

// FileManager API
export { FileManager, getFileManager, resetFileManager } from './FileManager';
export type { FileStats } from './FileManager';

// Settings API
export { 
  Settings, 
  Setting, 
  TextComponent, 
  ToggleComponent, 
  DropdownComponent, 
  SliderComponent, 
  ButtonComponent,
  getSettings,
  resetSettings 
} from './Settings';
export type { PluginSettingTab } from './Settings';

// Hotkeys API
export { 
  Hotkeys, 
  HotkeyUtils,
  getHotkeys,
  resetHotkeys 
} from './Hotkeys';
export type { Hotkey, HotkeyCommand } from './Hotkeys';
