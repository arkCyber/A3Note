/**
 * Obsidian Plugin Manifest
 * Based on Obsidian's plugin manifest structure
 */

export interface PluginManifest {
  /** Unique plugin ID */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Minimum app version required */
  minAppVersion: string;
  
  /** Plugin description */
  description: string;
  
  /** Author name */
  author: string;
  
  /** Author URL */
  authorUrl?: string;
  
  /** Is this plugin desktop-only? */
  isDesktopOnly?: boolean;
  
  /** Plugin dependencies */
  dependencies?: string[];
  
  /** Required permissions */
  permissions?: PluginPermission[];
}

export enum PluginPermission {
  READ_FILES = 'read-files',
  WRITE_FILES = 'write-files',
  DELETE_FILES = 'delete-files',
  NETWORK = 'network',
  EXECUTE_COMMANDS = 'execute-commands',
  ACCESS_SETTINGS = 'access-settings',
  MODIFY_UI = 'modify-ui',
}

export interface PluginConfig {
  /** Plugin ID */
  id: string;
  
  /** Is plugin enabled? */
  enabled: boolean;
  
  /** Plugin version */
  version: string;
  
  /** Plugin settings */
  settings: Record<string, any>;
  
  /** Installation date */
  installedAt: number;
  
  /** Last update date */
  updatedAt?: number;
}

export interface PluginMetadata {
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Plugin configuration */
  config: PluginConfig;
  
  /** Plugin directory path */
  dir: string;
  
  /** Main file path */
  mainFile: string;
  
  /** Styles file path */
  stylesFile?: string;
}
