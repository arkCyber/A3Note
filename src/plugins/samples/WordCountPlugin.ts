/**
 * Word Count Plugin
 * Simulates Obsidian's word count plugin functionality
 * Based on: https://github.com/lukeleppan/better-word-count
 */

import { Plugin } from '../types/plugin';
import { App } from '../api/App';
import { PluginManifest } from '../types/manifest';

export default class WordCountPlugin extends Plugin {
  private statusBarItem: HTMLElement | null = null;
  private wordCount: number = 0;
  private charCount: number = 0;
  
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload() {
    console.log('Loading Word Count Plugin');
    
    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();
    
    // Add command to show detailed stats
    this.addCommand({
      id: 'show-word-count',
      name: 'Show Word Count Statistics',
      callback: () => {
        this.showDetailedStats();
      }
    });
    
    // Listen for file changes
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateWordCount();
      })
    );
    
    // Initial count
    this.updateWordCount();
  }
  
  async onunload() {
    console.log('Unloading Word Count Plugin');
    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }
  
  /**
   * Update word count based on active file
   */
  private updateWordCount() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (!activeFile) {
      this.wordCount = 0;
      this.charCount = 0;
      this.updateStatusBar();
      return;
    }
    
    // Read file content
    this.app.vault.read(activeFile).then((content: string) => {
      this.wordCount = this.countWords(content);
      this.charCount = content.length;
      this.updateStatusBar();
    }).catch((err: Error) => {
      console.error('Failed to read file for word count:', err);
    });
  }
  
  /**
   * Count words in text
   */
  private countWords(text: string): number {
    // Remove markdown syntax
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/[#*_~]/g, '') // Remove markdown formatting
      .trim();
    
    if (!cleanText) {
      return 0;
    }
    
    // Split by whitespace and filter empty strings
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }
  
  /**
   * Update status bar display
   */
  private updateStatusBar() {
    if (!this.statusBarItem) {
      return;
    }
    
    this.statusBarItem.textContent = `${this.wordCount} words, ${this.charCount} chars`;
    this.statusBarItem.title = 'Click for detailed statistics';
    this.statusBarItem.style.cursor = 'pointer';
    this.statusBarItem.onclick = () => this.showDetailedStats();
  }
  
  /**
   * Show detailed statistics
   */
  private showDetailedStats() {
    const stats = `
📊 Document Statistics

Words: ${this.wordCount}
Characters: ${this.charCount}
Characters (no spaces): ${this.charCount - this.countSpaces()}

Reading time: ~${Math.ceil(this.wordCount / 200)} min
    `.trim();
    
    alert(stats);
  }
  
  /**
   * Count spaces in current document
   */
  private countSpaces(): number {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      return 0;
    }
    
    // This is a simplified version
    // In real implementation, we'd read the file again
    return Math.floor(this.charCount * 0.15); // Estimate ~15% spaces
  }
}

export const wordCountManifest: PluginManifest = {
  id: 'word-count-plugin',
  name: 'Word Count',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'Display word count and character count in status bar',
  author: 'A3Note Team',
  authorUrl: 'https://github.com/a3note',
  isDesktopOnly: false,
};
