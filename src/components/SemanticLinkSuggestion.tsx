// Semantic Link Suggestion Component - Aerospace Grade
// Intelligent link suggestions based on semantic similarity

import React, { useState, useEffect, useCallback } from 'react';
import { Link2, TrendingUp, X } from 'lucide-react';
import { semanticSearch, type LinkSuggestion } from '../services/ai/semantic-search';
import { debounce } from 'lodash';

interface SemanticLinkSuggestionProps {
  currentText: string;
  onSelectLink: (path: string, title: string) => void;
  onClose?: () => void;
  visible?: boolean;
}

export default function SemanticLinkSuggestion({
  currentText,
  onSelectLink,
  onClose,
  visible = true,
}: SemanticLinkSuggestionProps) {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced suggestion fetcher
  const fetchSuggestions = useCallback(
    debounce(async (text: string) => {
      if (!text || text.trim().length < 10) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await semanticSearch.suggestLinks(text, 5);
        setSuggestions(results);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setError('获取建议失败');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Update suggestions when text changes
  useEffect(() => {
    if (visible) {
      fetchSuggestions(currentText);
    }
  }, [currentText, visible, fetchSuggestions]);

  // Handle link selection
  const handleSelect = (suggestion: LinkSuggestion) => {
    onSelectLink(suggestion.path, suggestion.title);
    if (onClose) {
      onClose();
    }
  };

  if (!visible || (!isLoading && suggestions.length === 0 && !error)) {
    return null;
  }

  return (
    <div className="absolute z-50 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-primary" />
          <span className="text-sm font-semibold">智能链接建议</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-sm text-foreground/60">
            正在分析相关笔记...
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {!isLoading && suggestions.length === 0 && !error && (
          <div className="p-4 text-center text-sm text-foreground/60">
            没有找到相关笔记
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="divide-y divide-border">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full p-3 text-left hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {suggestion.title}
                    </div>
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground/60 shrink-0">
                    <TrendingUp size={12} />
                    <span>{(suggestion.similarity * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {suggestion.snippet && (
                  <div className="text-xs text-foreground/60 mt-1 line-clamp-2">
                    {suggestion.snippet}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {suggestions.length > 0 && (
        <div className="p-2 border-t border-border bg-secondary text-xs text-foreground/60 text-center">
          基于语义相似度排序
        </div>
      )}
    </div>
  );
}
