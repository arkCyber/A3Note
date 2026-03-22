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
