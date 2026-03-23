// Semantic Search Service - Aerospace Grade
// TypeScript service for semantic search and link suggestions

import { invoke } from '@tauri-apps/api/tauri';

/**
 * Search result from semantic search
 */
export interface SearchResult {
  path: string;
  title: string;
  tags: string[];
  similarity: number;
}

/**
 * Link suggestion for current context
 */
export interface LinkSuggestion extends SearchResult {
  snippet?: string;
}

/**
 * Index statistics
 */
export interface IndexStats {
  total_documents: number;
  indexed_paths: string[];
}

/**
 * Semantic search service
 * Provides semantic search and intelligent link suggestions
 */
export class SemanticSearchService {
  private static instance: SemanticSearchService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SemanticSearchService {
    if (!SemanticSearchService.instance) {
      SemanticSearchService.instance = new SemanticSearchService();
    }
    return SemanticSearchService.instance;
  }

  /**
   * Index a document for semantic search
   * 
   * @param path - Document path
   * @param title - Document title
   * @param content - Document content
   * @param tags - Document tags
   */
  async indexDocument(
    path: string,
    title: string,
    content: string,
    tags: string[] = []
  ): Promise<void> {
    try {
      await invoke('index_document', {
        path,
        title,
        content,
        tags,
      });
      console.log(`[SemanticSearch] Indexed: ${path}`);
    } catch (error) {
      console.error(`[SemanticSearch] Failed to index ${path}:`, error);
      throw error;
    }
  }

  /**
   * Remove document from index
   * 
   * @param path - Document path
   */
  async removeFromIndex(path: string): Promise<void> {
    try {
      await invoke('remove_from_index', { path });
      console.log(`[SemanticSearch] Removed from index: ${path}`);
    } catch (error) {
      console.error(`[SemanticSearch] Failed to remove ${path}:`, error);
      throw error;
    }
  }

  /**
   * Perform semantic search
   * 
   * @param query - Search query
   * @param topK - Number of results to return
   * @param minSimilarity - Minimum similarity threshold (0-1)
   * @returns Array of search results sorted by similarity
   */
  async search(
    query: string,
    topK: number = 10,
    minSimilarity: number = 0.6
  ): Promise<SearchResult[]> {
    try {
      console.log(`[SemanticSearch] Searching: "${query}" (top ${topK}, min ${minSimilarity})`);
      
      const results = await invoke<SearchResult[]>('semantic_search', {
        query,
        topK,
        minSimilarity,
      });

      console.log(`[SemanticSearch] Found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('[SemanticSearch] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get intelligent link suggestions based on current text
   * 
   * @param currentText - Current editor text
   * @param topK - Number of suggestions
   * @returns Array of link suggestions
   */
  async suggestLinks(
    currentText: string,
    topK: number = 5
  ): Promise<LinkSuggestion[]> {
    try {
      if (!currentText || currentText.trim().length < 10) {
        return [];
      }

      console.log(`[SemanticSearch] Getting link suggestions (${currentText.length} chars)`);
      
      const results = await invoke<SearchResult[]>('suggest_links', {
        currentText,
        topK,
      });

      console.log(`[SemanticSearch] Found ${results.length} suggestions`);
      return results;
    } catch (error) {
      console.error('[SemanticSearch] Link suggestion failed:', error);
      return [];
    }
  }

  /**
   * Get index statistics
   * 
   * @returns Index statistics
   */
  async getIndexStats(): Promise<IndexStats> {
    try {
      const stats = await invoke<IndexStats>('get_index_stats');
      console.log(`[SemanticSearch] Index stats: ${stats.total_documents} documents`);
      return stats;
    } catch (error) {
      console.error('[SemanticSearch] Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Clear the entire index
   */
  async clearIndex(): Promise<void> {
    try {
      await invoke('clear_index');
      console.log('[SemanticSearch] Index cleared');
    } catch (error) {
      console.error('[SemanticSearch] Failed to clear index:', error);
      throw error;
    }
  }

  /**
   * Batch index multiple documents
   * 
   * @param documents - Array of documents to index
   */
  async batchIndex(
    documents: Array<{
      path: string;
      title: string;
      content: string;
      tags?: string[];
    }>
  ): Promise<void> {
    console.log(`[SemanticSearch] Batch indexing ${documents.length} documents`);
    
    const results = await Promise.allSettled(
      documents.map(doc =>
        this.indexDocument(doc.path, doc.title, doc.content, doc.tags || [])
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[SemanticSearch] Batch index complete: ${succeeded} succeeded, ${failed} failed`);

    if (failed > 0) {
      console.warn('[SemanticSearch] Some documents failed to index');
    }
  }
}

// Export singleton instance
export const semanticSearch = SemanticSearchService.getInstance();
