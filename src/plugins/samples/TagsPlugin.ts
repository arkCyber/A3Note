/**
 * Tags Plugin
 * Displays and manages tags in the vault
 */

import { Plugin } from '../types/plugin';
import { App } from '../api/App';
import { PluginManifest } from '../types/manifest';

export default class TagsPlugin extends Plugin {
  private statusBarItem: HTMLElement | null = null;
  private tagsCount: number = 0;
  
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload() {
    console.log('Loading Tags Plugin');
    
    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();
    
    // Add command to show all tags
    this.addCommand({
      id: 'show-all-tags',
      name: 'Show All Tags',
      callback: () => {
        this.showAllTags();
      }
    });
    
    // Add command to search by tag
    this.addCommand({
      id: 'search-by-tag',
      name: 'Search by Tag',
      callback: () => {
        this.searchByTag();
      }
    });
    
    // Add ribbon icon
    this.addRibbonIcon('tag', 'Show Tags', () => {
      this.showAllTags();
    });
    
    // Listen for file changes
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateTags();
      })
    );
    
    // Initial update
    this.updateTags();
  }
  
  async onunload() {
    console.log('Unloading Tags Plugin');
    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }
  
  /**
   * Update tags count
   */
  private updateTags() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      this.tagsCount = 0;
      this.updateStatusBar();
      return;
    }
    
    // Get tags from metadata cache
    const metadata = this.app.metadataCache.getFileCache(activeFile);
    this.tagsCount = metadata?.tags?.length || 0;
    this.updateStatusBar();
  }
  
  /**
   * Update status bar display
   */
  private updateStatusBar() {
    if (!this.statusBarItem) {
      return;
    }
    
    this.statusBarItem.textContent = `🏷️ ${this.tagsCount} tags`;
    this.statusBarItem.title = 'Click to show all tags';
    this.statusBarItem.style.cursor = 'pointer';
    this.statusBarItem.onclick = () => this.showAllTags();
  }
  
  /**
   * Show all tags in vault
   */
  private showAllTags() {
    const files = this.app.vault.getMarkdownFiles();
    const allTags = new Map<string, number>();
    
    files.forEach((file: any) => {
      const metadata = this.app.metadataCache.getFileCache(file);
      if (metadata?.tags) {
        metadata.tags.forEach((tagInfo: any) => {
          const tag = tagInfo.tag;
          allTags.set(tag, (allTags.get(tag) || 0) + 1);
        });
      }
    });
    
    if (allTags.size === 0) {
      alert('No tags found in vault');
      return;
    }
    
    // Sort tags by frequency
    const sortedTags = Array.from(allTags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 tags
    
    const tagsList = sortedTags
      .map(([tag, count]) => `${tag} (${count})`)
      .join('\n');
    
    const message = `
🏷️ All Tags (${allTags.size} unique)

Top 20 tags:
${tagsList}
    `.trim();
    
    alert(message);
  }
  
  /**
   * Search files by tag
   */
  private searchByTag() {
    const tag = prompt('Enter tag to search (e.g., #todo):');
    
    if (!tag) {
      return;
    }
    
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const files = this.app.vault.getMarkdownFiles();
    const matchingFiles: string[] = [];
    
    files.forEach((file: any) => {
      const metadata = this.app.metadataCache.getFileCache(file);
      if (metadata?.tags) {
        const hasTag = metadata.tags.some((tagInfo: any) => 
          tagInfo.tag === normalizedTag
        );
        if (hasTag) {
          matchingFiles.push(file.name);
        }
      }
    });
    
    if (matchingFiles.length === 0) {
      alert(`No files found with tag ${normalizedTag}`);
      return;
    }
    
    const message = `
🔍 Files with tag ${normalizedTag}

Found ${matchingFiles.length} files:
${matchingFiles.slice(0, 20).join('\n')}
    `.trim();
    
    alert(message);
  }
}

export const tagsManifest: PluginManifest = {
  id: 'tags-plugin',
  name: 'Tags',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'View and search tags in your vault',
  author: 'A3Note Team',
  authorUrl: 'https://github.com/a3note',
  isDesktopOnly: false,
};
