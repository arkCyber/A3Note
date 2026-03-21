/**
 * Plugin API Exports
 * Export all Obsidian-compatible APIs
 */

export { App, app, Commands } from './App';
export { Vault, TFile, TFolder } from './Vault';
export { Workspace, WorkspaceLeaf } from './Workspace';
export {
  MetadataCache,
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
