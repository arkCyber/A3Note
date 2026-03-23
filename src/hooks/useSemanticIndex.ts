// Semantic Index Hook - Aerospace Grade
// Auto-indexing hook for semantic search

import { useEffect, useCallback } from 'react';
import { semanticSearch } from '../services/ai/semantic-search';
import { log } from '../utils/logger';

interface UseSemanticIndexOptions {
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook for automatic semantic indexing
 * Indexes documents when they are saved
 */
export function useSemanticIndex(
  filePath: string | null,
  content: string | null,
  options: UseSemanticIndexOptions = {}
) {
  const { enabled = true, debounceMs = 2000 } = options;

  const indexDocument = useCallback(async () => {
    if (!enabled || !filePath || !content) {
      return;
    }

    try {
      // Extract title from first line or filename
      const lines = content.split('\n');
      let title = filePath.split('/').pop()?.replace('.md', '') || 'Untitled';
      
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.match(/^#+\s+/)) {
          title = firstLine.replace(/^#+\s+/, '');
        }
      }

      // Extract tags from content (e.g., #tag)
      const tagMatches = content.match(/#[\w\u4e00-\u9fa5]+/g) || [];
      const tags = tagMatches.map(tag => tag.substring(1));

      log.info(`[SemanticIndex] Indexing: ${filePath}`);

      await semanticSearch.indexDocument(
        filePath,
        title,
        content,
        tags
      );

      log.info(`[SemanticIndex] Successfully indexed: ${filePath}`);
    } catch (error) {
      log.error(`[SemanticIndex] Failed to index ${filePath}:`, error);
    }
  }, [filePath, content, enabled]);

  // Auto-index when content changes (debounced)
  useEffect(() => {
    if (!enabled || !filePath || !content) {
      return;
    }

    const timer = setTimeout(() => {
      indexDocument();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filePath, content, enabled, debounceMs, indexDocument]);

  return {
    indexDocument,
  };
}
