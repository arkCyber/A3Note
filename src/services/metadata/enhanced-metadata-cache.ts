/**
 * Enhanced Metadata Cache
 * Aerospace-grade metadata caching with indexing and query support
 */

import { MetadataExtractor, FileMetadata } from './metadata-extractor';
import { log } from '../../utils/logger';

export interface CacheStats {
  totalFiles: number;
  totalLinks: number;
  totalTags: number;
  totalHeadings: number;
  cacheSize: number;
  lastUpdate: number;
}

export interface BacklinkInfo {
  sourcePath: string;
  position: {
    line: number;
    col: number;
  };
  context: string;
}

/**
 * Enhanced Metadata Cache
 */
export class EnhancedMetadataCache {
  private cache: Map<string, FileMetadata> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private linkIndex: Map<string, Set<string>> = new Map();
  private backlinkIndex: Map<string, BacklinkInfo[]> = new Map();
  private headingIndex: Map<string, Map<string, string[]>> = new Map();
  private dirty: Set<string> = new Set();

  /**
   * Get metadata for a file
   */
  getMetadata(path: string): FileMetadata | null {
    return this.cache.get(path) || null;
  }

  /**
   * Set metadata for a file
   */
  setMetadata(path: string, metadata: FileMetadata): void {
    const oldMetadata = this.cache.get(path);
    
    // Remove old indexes
    if (oldMetadata) {
      this.removeFromIndexes(path, oldMetadata);
    }

    // Store new metadata
    this.cache.set(path, metadata);

    // Update indexes
    this.addToIndexes(path, metadata);

    // Mark as clean
    this.dirty.delete(path);

    log.debug('EnhancedMetadataCache', `Updated metadata for ${path}`);
  }

  /**
   * Update metadata for a file
   */
  async updateMetadata(path: string, content: string): Promise<void> {
    try {
      const metadata = MetadataExtractor.extract(content, path);
      this.setMetadata(path, metadata);
    } catch (error) {
      log.error('EnhancedMetadataCache', `Failed to update metadata for ${path}`, error as Error);
      throw error;
    }
  }

  /**
   * Remove metadata for a file
   */
  removeMetadata(path: string): void {
    const metadata = this.cache.get(path);
    
    if (metadata) {
      this.removeFromIndexes(path, metadata);
      this.cache.delete(path);
      this.dirty.delete(path);
      
      log.debug('EnhancedMetadataCache', `Removed metadata for ${path}`);
    }
  }

  /**
   * Add metadata to indexes
   */
  private addToIndexes(path: string, metadata: FileMetadata): void {
    // Index tags
    for (const tag of metadata.tags) {
      if (!this.tagIndex.has(tag.tag)) {
        this.tagIndex.set(tag.tag, new Set());
      }
      this.tagIndex.get(tag.tag)!.add(path);
    }

    // Index links
    for (const link of metadata.links) {
      const targetPath = this.normalizePath(link.target);
      
      if (!this.linkIndex.has(targetPath)) {
        this.linkIndex.set(targetPath, new Set());
      }
      this.linkIndex.get(targetPath)!.add(path);

      // Add to backlink index
      if (!this.backlinkIndex.has(targetPath)) {
        this.backlinkIndex.set(targetPath, []);
      }
      
      this.backlinkIndex.get(targetPath)!.push({
        sourcePath: path,
        position: {
          line: link.position.start.line,
          col: link.position.start.col,
        },
        context: this.extractContext(metadata, link.position.start.line),
      });
    }

    // Index headings
    if (metadata.headings.length > 0) {
      const headingMap = new Map<string, string[]>();
      
      for (const heading of metadata.headings) {
        const key = `h${heading.level}`;
        if (!headingMap.has(key)) {
          headingMap.set(key, []);
        }
        headingMap.get(key)!.push(heading.text);
      }
      
      this.headingIndex.set(path, headingMap);
    }
  }

  /**
   * Remove metadata from indexes
   */
  private removeFromIndexes(path: string, metadata: FileMetadata): void {
    // Remove from tag index
    for (const tag of metadata.tags) {
      const files = this.tagIndex.get(tag.tag);
      if (files) {
        files.delete(path);
        if (files.size === 0) {
          this.tagIndex.delete(tag.tag);
        }
      }
    }

    // Remove from link index
    for (const link of metadata.links) {
      const targetPath = this.normalizePath(link.target);
      const files = this.linkIndex.get(targetPath);
      
      if (files) {
        files.delete(path);
        if (files.size === 0) {
          this.linkIndex.delete(targetPath);
        }
      }
    }

    // Remove from backlink index
    for (const link of metadata.links) {
      const targetPath = this.normalizePath(link.target);
      const backlinks = this.backlinkIndex.get(targetPath);
      
      if (backlinks) {
        const filtered = backlinks.filter(bl => bl.sourcePath !== path);
        if (filtered.length === 0) {
          this.backlinkIndex.delete(targetPath);
        } else {
          this.backlinkIndex.set(targetPath, filtered);
        }
      }
    }

    // Remove from heading index
    this.headingIndex.delete(path);
  }

  /**
   * Extract context around a line
   */
  private extractContext(metadata: FileMetadata, line: number): string {
    // This is a simplified version
    // In a real implementation, you'd extract actual content
    return `Line ${line}`;
  }

  /**
   * Normalize file path
   */
  private normalizePath(path: string): string {
    // Remove .md extension if present
    let normalized = path.endsWith('.md') ? path : `${path}.md`;
    
    // Remove leading slash
    if (normalized.startsWith('/')) {
      normalized = normalized.substring(1);
    }
    
    return normalized;
  }

  /**
   * Get files with a specific tag
   */
  getFilesWithTag(tag: string): string[] {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const files = this.tagIndex.get(normalizedTag);
    return files ? Array.from(files) : [];
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    return Array.from(this.tagIndex.keys()).sort();
  }

  /**
   * Get backlinks for a file
   */
  getBacklinks(path: string): BacklinkInfo[] {
    const normalizedPath = this.normalizePath(path);
    return this.backlinkIndex.get(normalizedPath) || [];
  }

  /**
   * Get outgoing links from a file
   */
  getOutgoingLinks(path: string): string[] {
    const metadata = this.cache.get(path);
    if (!metadata) {
      return [];
    }
    
    return metadata.links.map(link => this.normalizePath(link.target));
  }

  /**
   * Get files linking to a target
   */
  getFilesLinkingTo(targetPath: string): string[] {
    const normalizedPath = this.normalizePath(targetPath);
    const files = this.linkIndex.get(normalizedPath);
    return files ? Array.from(files) : [];
  }

  /**
   * Get headings for a file
   */
  getHeadings(path: string): Map<string, string[]> | null {
    return this.headingIndex.get(path) || null;
  }

  /**
   * Search files by frontmatter field
   */
  searchByFrontmatter(field: string, value?: string): FileMetadata[] {
    const results: FileMetadata[] = [];

    for (const metadata of this.cache.values()) {
      if (!metadata.frontmatter) {
        continue;
      }

      const fieldValue = metadata.frontmatter[field];
      
      if (fieldValue === undefined) {
        continue;
      }

      if (value === undefined) {
        // Just check if field exists
        results.push(metadata);
      } else {
        // Check if value matches
        const valueStr = String(fieldValue);
        if (valueStr === value || valueStr.includes(value)) {
          results.push(metadata);
        }
      }
    }

    return results;
  }

  /**
   * Search files by inline field
   */
  searchByInlineField(field: string, value?: string): FileMetadata[] {
    const results: FileMetadata[] = [];

    for (const metadata of this.cache.values()) {
      const fieldValues = metadata.inlineFields[field];
      
      if (!fieldValues || fieldValues.length === 0) {
        continue;
      }

      if (value === undefined) {
        // Just check if field exists
        results.push(metadata);
      } else {
        // Check if any value matches
        if (fieldValues.some(v => v === value || v.includes(value))) {
          results.push(metadata);
        }
      }
    }

    return results;
  }

  /**
   * Get all files
   */
  getAllFiles(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all metadata
   */
  getAllMetadata(): FileMetadata[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalLinks = 0;
    let totalTags = 0;
    let totalHeadings = 0;

    for (const metadata of this.cache.values()) {
      totalLinks += metadata.links.length;
      totalTags += metadata.tags.length;
      totalHeadings += metadata.headings.length;
    }

    return {
      totalFiles: this.cache.size,
      totalLinks,
      totalTags: this.tagIndex.size,
      totalHeadings,
      cacheSize: this.estimateCacheSize(),
      lastUpdate: Date.now(),
    };
  }

  /**
   * Estimate cache size in bytes
   */
  private estimateCacheSize(): number {
    // Rough estimation
    let size = 0;
    
    for (const metadata of this.cache.values()) {
      size += JSON.stringify(metadata).length;
    }
    
    return size;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    this.linkIndex.clear();
    this.backlinkIndex.clear();
    this.headingIndex.clear();
    this.dirty.clear();
    
    log.info('EnhancedMetadataCache', 'Cache cleared');
  }

  /**
   * Mark file as dirty (needs update)
   */
  markDirty(path: string): void {
    this.dirty.add(path);
  }

  /**
   * Get dirty files
   */
  getDirtyFiles(): string[] {
    return Array.from(this.dirty);
  }

  /**
   * Check if file is dirty
   */
  isDirty(path: string): boolean {
    return this.dirty.has(path);
  }

  /**
   * Batch update multiple files
   */
  async batchUpdate(files: Array<{ path: string; content: string }>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const metadataList = MetadataExtractor.extractBatch(files);
      
      for (const metadata of metadataList) {
        this.setMetadata(metadata.path, metadata);
      }
      
      const duration = Date.now() - startTime;
      log.info('EnhancedMetadataCache', `Batch updated ${files.length} files in ${duration}ms`);
    } catch (error) {
      log.error('EnhancedMetadataCache', 'Batch update failed', error as Error);
      throw error;
    }
  }

  /**
   * Export cache to JSON
   */
  export(): string {
    const data = {
      cache: Array.from(this.cache.entries()),
      stats: this.getStats(),
      timestamp: Date.now(),
    };
    
    return JSON.stringify(data);
  }

  /**
   * Import cache from JSON
   */
  import(json: string): void {
    try {
      const data = JSON.parse(json);
      
      this.clear();
      
      for (const [path, metadata] of data.cache) {
        this.setMetadata(path, metadata);
      }
      
      log.info('EnhancedMetadataCache', `Imported ${this.cache.size} files`);
    } catch (error) {
      log.error('EnhancedMetadataCache', 'Import failed', error as Error);
      throw error;
    }
  }

  /**
   * Validate cache integrity
   */
  validate(): Array<{ path: string; error: string }> {
    const errors: Array<{ path: string; error: string }> = [];

    for (const [path, metadata] of this.cache.entries()) {
      // Check if metadata is valid
      if (!metadata.path) {
        errors.push({ path, error: 'Missing path' });
      }

      if (metadata.path !== path) {
        errors.push({ path, error: 'Path mismatch' });
      }

      // Check if indexes are consistent
      for (const tag of metadata.tags) {
        const files = this.tagIndex.get(tag.tag);
        if (!files || !files.has(path)) {
          errors.push({ path, error: `Tag index inconsistency: ${tag.tag}` });
        }
      }
    }

    return errors;
  }
}

/**
 * Singleton instance
 */
let instance: EnhancedMetadataCache | null = null;

export function getMetadataCache(): EnhancedMetadataCache {
  if (!instance) {
    instance = new EnhancedMetadataCache();
  }
  return instance;
}

export function resetMetadataCache(): void {
  instance = null;
}
