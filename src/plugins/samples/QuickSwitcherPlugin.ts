/**
 * Quick Switcher Plugin
 * Simulates Obsidian's quick switcher functionality
 */

import { Plugin } from '../types/plugin';
import { App } from '../api/App';
import { PluginManifest } from '../types/manifest';

export default class QuickSwitcherPlugin extends Plugin {
  private isOpen: boolean = false;
  
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload() {
    console.log('Loading Quick Switcher Plugin');
    
    // Add command to open quick switcher
    this.addCommand({
      id: 'open-quick-switcher',
      name: 'Open Quick Switcher',
      hotkeys: [{ modifiers: ['Mod'], key: 'o' }],
      callback: () => {
        this.openQuickSwitcher();
      }
    });
    
    // Add command to search in current file
    this.addCommand({
      id: 'search-current-file',
      name: 'Search in Current File',
      hotkeys: [{ modifiers: ['Mod'], key: 'f' }],
      callback: () => {
        this.searchInCurrentFile();
      }
    });
    
    // Add ribbon icon
    this.addRibbonIcon('search', 'Quick Switcher', () => {
      this.openQuickSwitcher();
    });
  }
  
  async onunload() {
    console.log('Unloading Quick Switcher Plugin');
  }
  
  /**
   * Open quick switcher modal
   */
  private openQuickSwitcher() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // Get all markdown files
    const files = this.app.vault.getMarkdownFiles();
    
    if (files.length === 0) {
      alert('No markdown files found in vault');
      this.isOpen = false;
      return;
    }
    
    // Show file list (simplified version)
    const fileNames = files.map((f: any) => f.name).join('\n');
    const selected = prompt(`Quick Switcher (${files.length} files):\n\n${fileNames}\n\nEnter file name to open:`);
    
    if (selected) {
      const matchedFile = files.find((f: any) => 
        f.name.toLowerCase().includes(selected.toLowerCase())
      );
      
      if (matchedFile) {
        this.app.workspace.setActiveFile(matchedFile);
        console.log('Opened file:', matchedFile.name);
      } else {
        alert(`File not found: ${selected}`);
      }
    }
    
    this.isOpen = false;
  }
  
  /**
   * Search in current file
   */
  private searchInCurrentFile() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      alert('No active file');
      return;
    }
    
    const searchTerm = prompt(`Search in ${activeFile.name}:`);
    
    if (!searchTerm) return;
    
    this.app.vault.read(activeFile).then((content: string) => {
      const lines = content.split('\n');
      const matches: string[] = [];
      
      lines.forEach((line: string, index: number) => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(`Line ${index + 1}: ${line.trim()}`);
        }
      });
      
      if (matches.length > 0) {
        alert(`Found ${matches.length} matches:\n\n${matches.slice(0, 10).join('\n')}`);
      } else {
        alert(`No matches found for "${searchTerm}"`);
      }
    }).catch((err: Error) => {
      console.error('Failed to search file:', err);
      alert('Failed to search file');
    });
  }
}

export const quickSwitcherManifest: PluginManifest = {
  id: 'quick-switcher-plugin',
  name: 'Quick Switcher',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'Quickly switch between files and search',
  author: 'A3Note Team',
  authorUrl: 'https://github.com/a3note',
  isDesktopOnly: false,
};
