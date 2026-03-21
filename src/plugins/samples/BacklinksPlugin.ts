/**
 * Backlinks Plugin
 * Shows backlinks for the current file
 */

import { Plugin } from '../types/plugin';
import { App } from '../api/App';
import { PluginManifest } from '../types/manifest';

export default class BacklinksPlugin extends Plugin {
  private statusBarItem: HTMLElement | null = null;
  private backlinksCount: number = 0;
  
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload() {
    console.log('Loading Backlinks Plugin');
    
    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();
    
    // Add command to show backlinks
    this.addCommand({
      id: 'show-backlinks',
      name: 'Show Backlinks',
      callback: () => {
        this.showBacklinks();
      }
    });
    
    // Add ribbon icon
    this.addRibbonIcon('link', 'Show Backlinks', () => {
      this.showBacklinks();
    });
    
    // Listen for file changes
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateBacklinks();
      })
    );
    
    // Initial update
    this.updateBacklinks();
  }
  
  async onunload() {
    console.log('Unloading Backlinks Plugin');
    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }
  
  /**
   * Update backlinks for current file
   */
  private updateBacklinks() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      this.backlinksCount = 0;
      this.updateStatusBar();
      return;
    }
    
    // Get backlinks from metadata cache
    const backlinks = this.app.metadataCache.getBacklinksForFile(activeFile);
    this.backlinksCount = backlinks.size;
    this.updateStatusBar();
  }
  
  /**
   * Update status bar display
   */
  private updateStatusBar() {
    if (!this.statusBarItem) return;
    
    this.statusBarItem.textContent = `🔗 ${this.backlinksCount} backlinks`;
    this.statusBarItem.title = 'Click to show backlinks';
    this.statusBarItem.style.cursor = 'pointer';
    this.statusBarItem.onclick = () => this.showBacklinks();
  }
  
  /**
   * Show backlinks in a modal
   */
  private showBacklinks() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      alert('No active file');
      return;
    }
    
    const backlinks = this.app.metadataCache.getBacklinksForFile(activeFile);
    
    if (backlinks.size === 0) {
      alert(`No backlinks found for "${activeFile.name}"`);
      return;
    }
    
    // Build backlinks list
    const backlinksList: string[] = [];
    backlinks.forEach((links: any, sourcePath: string) => {
      const fileName = sourcePath.split('/').pop() || sourcePath;
      backlinksList.push(`📄 ${fileName} (${links.length} links)`);
    });
    
    const message = `
🔗 Backlinks for "${activeFile.name}"

Found ${backlinks.size} files linking to this note:

${backlinksList.join('\n')}
    `.trim();
    
    alert(message);
  }
}

export const backlinksManifest: PluginManifest = {
  id: 'backlinks-plugin',
  name: 'Backlinks',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'Show backlinks for the current file',
  author: 'A3Note Team',
  authorUrl: 'https://github.com/a3note',
  isDesktopOnly: false,
};
