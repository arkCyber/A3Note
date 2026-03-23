// Batch Indexer Service - Aerospace Grade
// Efficiently indexes entire workspace for semantic search

import { invoke } from '@tauri-apps/api/tauri';
import { semanticSearch } from './semantic-search';
import { log } from '../../utils/logger';

export interface IndexingProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface IndexingResult {
  success: number;
  failed: number;
  skipped: number;
  totalTime: number;
}

/**
 * Batch Indexer Service
 * Indexes all markdown files in workspace for semantic search
 */
export class BatchIndexer {
  private static instance: BatchIndexer;
  private isIndexing = false;
  private abortController: AbortController | null = null;

  private constructor() {}

  static getInstance(): BatchIndexer {
    if (!BatchIndexer.instance) {
      BatchIndexer.instance = new BatchIndexer();
    }
    return BatchIndexer.instance;
  }

  /**
   * Check if indexing is in progress
   */
  isRunning(): boolean {
    return this.isIndexing;
  }

  /**
   * Abort current indexing operation
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isIndexing = false;
      log.info('[BatchIndexer] Indexing aborted by user');
    }
  }

  /**
   * Index entire workspace
   * @param workspacePath - Path to workspace directory
   * @param onProgress - Progress callback
   * @returns Indexing result
   */
  async indexWorkspace(
    workspacePath: string,
    onProgress?: (progress: IndexingProgress) => void
  ): Promise<IndexingResult> {
    if (this.isIndexing) {
      throw new Error('Indexing already in progress');
    }

    this.isIndexing = true;
    this.abortController = new AbortController();

    const startTime = Date.now();
    const result: IndexingResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      totalTime: 0,
    };

    try {
      log.info('[BatchIndexer] Starting workspace indexing:', workspacePath);

      // Get all markdown files in workspace
      const files = await this.scanMarkdownFiles(workspacePath);
      log.info(`[BatchIndexer] Found ${files.length} markdown files`);

      // Index files one by one
      for (let i = 0; i < files.length; i++) {
        // Check if aborted
        if (this.abortController.signal.aborted) {
          log.info('[BatchIndexer] Indexing aborted');
          break;
        }

        const file = files[i];
        
        // Report progress
        const progress: IndexingProgress = {
          current: i + 1,
          total: files.length,
          currentFile: file.name,
          percentage: Math.round(((i + 1) / files.length) * 100),
        };
        onProgress?.(progress);

        try {
          // Read file content
          const content = await invoke<string>('read_file_content', {
            path: file.path,
          });

          // Skip empty files
          if (!content || content.trim().length === 0) {
            result.skipped++;
            log.debug(`[BatchIndexer] Skipped empty file: ${file.name}`);
            continue;
          }

          // Extract title from first line or filename
          const title = this.extractTitle(content, file.name);

          // Extract tags
          const tags = this.extractTags(content);

          // Index document
          await semanticSearch.indexDocument(
            file.path,
            title,
            content,
            tags
          );

          result.success++;
          log.debug(`[BatchIndexer] Indexed: ${file.name}`);

          // Small delay to avoid overwhelming the system
          await this.delay(50);
        } catch (error) {
          result.failed++;
          log.error(`[BatchIndexer] Failed to index ${file.name}:`, error);
        }
      }

      result.totalTime = Date.now() - startTime;

      log.info('[BatchIndexer] Indexing complete:', result);
      return result;
    } finally {
      this.isIndexing = false;
      this.abortController = null;
    }
  }

  /**
   * Scan workspace for all markdown files
   */
  private async scanMarkdownFiles(
    workspacePath: string
  ): Promise<Array<{ path: string; name: string }>> {
    try {
      const files = await invoke<Array<{ path: string; name: string; isDirectory: boolean }>>(
        'list_directory',
        { path: workspacePath }
      );

      // Filter markdown files and recursively scan directories
      const markdownFiles: Array<{ path: string; name: string }> = [];

      for (const file of files) {
        if (file.isDirectory) {
          // Recursively scan subdirectories
          const subFiles = await this.scanMarkdownFiles(file.path);
          markdownFiles.push(...subFiles);
        } else if (file.name.endsWith('.md')) {
          markdownFiles.push({
            path: file.path,
            name: file.name,
          });
        }
      }

      return markdownFiles;
    } catch (error) {
      log.error('[BatchIndexer] Failed to scan directory:', error);
      return [];
    }
  }

  /**
   * Extract title from content or filename
   */
  private extractTitle(content: string, filename: string): string {
    const lines = content.split('\n');
    
    // Try to extract from first heading
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^#+\s+/)) {
        return trimmed.replace(/^#+\s+/, '');
      }
    }

    // Fallback to filename without extension
    return filename.replace(/\.md$/, '');
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    const tagMatches = content.match(/#[\w\u4e00-\u9fa5]+/g) || [];
    return tagMatches.map(tag => tag.substring(1));
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get indexing statistics
   */
  async getStats() {
    return await semanticSearch.getIndexStats();
  }
}

// Export singleton instance
export const batchIndexer = BatchIndexer.getInstance();
