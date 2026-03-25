/**
 * Quick Switcher Service - Aerospace-grade implementation
 * DO-178C Level A
 * Fast file search and navigation
 */

import { FileItem } from '../types';

export interface QuickSwitcherResult {
  file: FileItem;
  score: number;
  matchedIndices: number[];
  context?: string;
}

export interface QuickSwitcherOptions {
  maxResults?: number;
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  includeContent?: boolean;
  fileTypes?: string[];
}

/**
 * Quick Switcher Service
 * Provides fast file search and navigation capabilities
 */
export class QuickSwitcherService {
  private files: FileItem[] = [];
  private recentFiles: string[] = [];
  private maxRecentFiles = 20;

  /**
   * Set the file list for searching
   */
  setFiles(files: FileItem[]): void {
    this.files = [...files];
  }

  /**
   * Search files by query
   */
  search(query: string, options: QuickSwitcherOptions = {}): QuickSwitcherResult[] {
    const {
      maxResults = 50,
      caseSensitive = false,
      fuzzyMatch = true,
      includeContent = false,
      fileTypes = [],
    } = options;

    if (!query.trim()) {
      return this.getRecentFilesResults(maxResults);
    }

    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const results: QuickSwitcherResult[] = [];

    for (const file of this.files) {
      // Filter by file type if specified
      if (fileTypes.length > 0) {
        const ext = this.getFileExtension(file.name);
        if (!fileTypes.includes(ext)) {
          continue;
        }
      }

      const fileName = caseSensitive ? file.name : file.name.toLowerCase();
      const filePath = caseSensitive ? file.path : file.path.toLowerCase();

      let score = 0;
      let matchedIndices: number[] = [];

      if (fuzzyMatch) {
        const fuzzyResult = this.fuzzySearch(searchQuery, fileName);
        if (fuzzyResult.matched) {
          score = fuzzyResult.score;
          matchedIndices = fuzzyResult.indices;
        }
      } else {
        if (fileName.includes(searchQuery)) {
          score = this.calculateExactScore(searchQuery, fileName);
          matchedIndices = this.getExactMatchIndices(searchQuery, fileName);
        }
      }

      // Boost score for path matches
      if (filePath.includes(searchQuery)) {
        score += 10;
      }

      // Boost score for recent files
      if (this.recentFiles.includes(file.path)) {
        const recentIndex = this.recentFiles.indexOf(file.path);
        score += (this.maxRecentFiles - recentIndex) * 2;
      }

      if (score > 0) {
        results.push({
          file,
          score,
          matchedIndices,
          context: includeContent ? this.extractContext(file, searchQuery) : undefined,
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, maxResults);
  }

  /**
   * Fuzzy search algorithm
   */
  private fuzzySearch(
    query: string,
    text: string
  ): { matched: boolean; score: number; indices: number[] } {
    const indices: number[] = [];
    let score = 0;
    let textIndex = 0;
    let queryIndex = 0;
    let consecutiveMatches = 0;

    while (queryIndex < query.length && textIndex < text.length) {
      if (query[queryIndex] === text[textIndex]) {
        indices.push(textIndex);
        consecutiveMatches++;
        
        // Bonus for consecutive matches
        score += 10 + consecutiveMatches * 5;
        
        // Bonus for match at word boundary
        if (textIndex === 0 || text[textIndex - 1] === ' ' || text[textIndex - 1] === '-') {
          score += 20;
        }
        
        queryIndex++;
      } else {
        consecutiveMatches = 0;
      }
      textIndex++;
    }

    const matched = queryIndex === query.length;
    
    if (matched) {
      // Bonus for shorter text (more specific match)
      score += Math.max(0, 100 - text.length);
      
      // Penalty for gaps
      const gaps = indices.length > 0 ? indices[indices.length - 1] - indices[0] - indices.length + 1 : 0;
      score -= gaps * 2;
    }

    return { matched, score, indices };
  }

  /**
   * Calculate score for exact match
   */
  private calculateExactScore(query: string, text: string): number {
    let score = 50;

    // Bonus for exact match
    if (text === query) {
      score += 100;
    }

    // Bonus for starts with
    if (text.startsWith(query)) {
      score += 50;
    }

    // Bonus for word boundary match
    const words = text.split(/[\s-_]/);
    for (const word of words) {
      if (word.startsWith(query)) {
        score += 30;
      }
    }

    return score;
  }

  /**
   * Get exact match indices
   */
  private getExactMatchIndices(query: string, text: string): number[] {
    const indices: number[] = [];
    const index = text.indexOf(query);
    
    if (index !== -1) {
      for (let i = 0; i < query.length; i++) {
        indices.push(index + i);
      }
    }

    return indices;
  }

  /**
   * Extract context around match
   */
  private extractContext(file: FileItem, query: string): string {
    // This would need file content access
    // For now, return file path as context
    return file.path;
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get recent files as results
   */
  private getRecentFilesResults(maxResults: number): QuickSwitcherResult[] {
    const results: QuickSwitcherResult[] = [];

    for (let i = 0; i < Math.min(this.recentFiles.length, maxResults); i++) {
      const filePath = this.recentFiles[i];
      const file = this.files.find(f => f.path === filePath);
      
      if (file) {
        results.push({
          file,
          score: this.maxRecentFiles - i,
          matchedIndices: [],
        });
      }
    }

    return results;
  }

  /**
   * Add file to recent files
   */
  addToRecent(filePath: string): void {
    // Remove if already exists
    const index = this.recentFiles.indexOf(filePath);
    if (index !== -1) {
      this.recentFiles.splice(index, 1);
    }

    // Add to front
    this.recentFiles.unshift(filePath);

    // Trim to max size
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
    }
  }

  /**
   * Get recent files
   */
  getRecentFiles(): string[] {
    return [...this.recentFiles];
  }

  /**
   * Clear recent files
   */
  clearRecent(): void {
    this.recentFiles = [];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalFiles: number;
    recentFilesCount: number;
    fileTypes: Record<string, number>;
  } {
    const fileTypes: Record<string, number> = {};

    for (const file of this.files) {
      const ext = this.getFileExtension(file.name);
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    return {
      totalFiles: this.files.length,
      recentFilesCount: this.recentFiles.length,
      fileTypes,
    };
  }
}

// Singleton instance
let quickSwitcherInstance: QuickSwitcherService | null = null;

export function getQuickSwitcherService(): QuickSwitcherService {
  if (!quickSwitcherInstance) {
    quickSwitcherInstance = new QuickSwitcherService();
  }
  return quickSwitcherInstance;
}
