/**
 * Sample Plugin
 * Demonstrates how to create an Obsidian-compatible plugin for A3Note
 */

import { Plugin } from '../types/plugin';
import { App } from '../api/App';
import { PluginManifest } from '../types/manifest';

export default class SamplePlugin extends Plugin {
  private statusBarItem: HTMLElement | null = null;
  
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload() {
    console.log('Loading Sample Plugin');
    
    // Add a command to the command palette
    this.addCommand({
      id: 'sample-hello',
      name: 'Say Hello',
      callback: () => {
        this.sayHello();
      },
    });
    
    // Add another command with editor callback
    this.addCommand({
      id: 'sample-insert-text',
      name: 'Insert Sample Text',
      callback: () => {
        this.insertSampleText();
      },
    });
    
    // Add a ribbon icon (left sidebar)
    this.addRibbonIcon('star', 'Sample Plugin', () => {
      console.log('Sample Plugin ribbon icon clicked!');
      this.sayHello();
    });
    
    // Add a status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.textContent = 'Sample Plugin Active';
    this.statusBarItem.style.cursor = 'pointer';
    this.statusBarItem.onclick = () => {
      this.showPluginInfo();
    };
    
    // Load plugin data
    const data = await this.loadData();
    if (data) {
      console.log('Loaded plugin data:', data);
    } else {
      // Save initial data
      await this.saveData({
        clickCount: 0,
        lastUsed: Date.now(),
      });
    }
    
    console.log('Sample Plugin loaded successfully!');
  }
  
  async onunload() {
    console.log('Unloading Sample Plugin');
    
    // Cleanup is handled automatically by the base Plugin class
    // But we can do additional cleanup here if needed
    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }
  
  /**
   * Say hello to the user
   */
  private sayHello() {
    console.log('Hello from Sample Plugin!');
    alert('Hello from Sample Plugin! 👋');
    
    // Update click count
    this.updateClickCount();
  }
  
  /**
   * Insert sample text into the current file
   */
  private insertSampleText() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (activeFile) {
      console.log('Inserting text into:', activeFile.name);
      
      // In a real implementation, this would insert text at cursor position
      // For now, we'll just show a message
      alert(`Would insert sample text into: ${activeFile.name}`);
    } else {
      alert('No active file. Please open a file first.');
    }
  }
  
  /**
   * Show plugin information
   */
  private showPluginInfo() {
    const info = `
Sample Plugin Information:
- Name: ${this.manifest.name}
- Version: ${this.manifest.version}
- Author: ${this.manifest.author}
- Description: ${this.manifest.description}
    `.trim();
    
    alert(info);
  }
  
  /**
   * Update click count in plugin data
   */
  private async updateClickCount() {
    const data = await this.loadData() || { clickCount: 0 };
    data.clickCount = (data.clickCount || 0) + 1;
    data.lastUsed = Date.now();
    await this.saveData(data);
    
    console.log('Click count updated:', data.clickCount);
  }
}

// Plugin manifest
export const samplePluginManifest: PluginManifest = {
  id: 'sample-plugin',
  name: 'Sample Plugin',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'A sample plugin demonstrating A3Note plugin capabilities',
  author: 'A3Note Team',
  authorUrl: 'https://github.com/a3note',
  isDesktopOnly: false,
};
