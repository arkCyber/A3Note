/**
 * Quick Switcher Component - Aerospace-grade UI
 * DO-178C Level A
 * Fast file search and navigation dialog
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, File, Clock, X } from 'lucide-react';
import { QuickSwitcherResult } from '../services/QuickSwitcherService';
import { FileItem } from '../types';

export interface QuickSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: FileItem) => void;
  results: QuickSwitcherResult[];
  onSearch: (query: string) => void;
  recentFiles?: string[];
}

export default function QuickSwitcher({
  isOpen,
  onClose,
  onSelectFile,
  results,
  onSearch,
  recentFiles = [],
}: QuickSwitcherProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    onSearch(query);
    setSelectedIndex(0);
  }, [query, onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].file);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (file: FileItem) => {
    onSelectFile(file);
    onClose();
  };

  const highlightMatch = (text: string, indices: number[]) => {
    if (indices.length === 0) {
      return <span>{text}</span>;
    }

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    indices.forEach((index, i) => {
      if (index > lastIndex) {
        parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, index)}</span>);
      }
      parts.push(
        <span key={`match-${i}`} className="text-primary font-semibold">
          {text[index]}
        </span>
      );
      lastIndex = index + 1;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50">
      <div
        className="w-full max-w-2xl bg-secondary border border-border rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={20} className="text-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 bg-transparent outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-background rounded transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="px-2 py-1 text-xs bg-background rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[400px] overflow-y-auto"
        >
          {results.length === 0 && query === '' && recentFiles.length > 0 && (
            <div className="px-4 py-2 text-xs font-semibold text-foreground/50">
              Recent Files
            </div>
          )}

          {results.length === 0 && query !== '' && (
            <div className="px-4 py-8 text-center text-foreground/50">
              No files found
            </div>
          )}

          {results.map((result, index) => {
            const isRecent = recentFiles.includes(result.file.path);
            const isSelected = index === selectedIndex;

            return (
              <button
                key={result.file.id}
                onClick={() => handleSelect(result.file)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-l-2 border-primary'
                    : 'hover:bg-background border-l-2 border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {isRecent ? (
                    <Clock size={16} className="text-foreground/50" />
                  ) : (
                    <File size={16} className="text-foreground/50" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {highlightMatch(result.file.name, result.matchedIndices)}
                  </div>
                  <div className="text-xs text-foreground/50 truncate">
                    {result.file.path}
                  </div>
                </div>

                {result.score > 0 && query !== '' && (
                  <div className="flex-shrink-0 text-xs text-foreground/40">
                    {Math.round(result.score)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-background/50">
          <div className="flex items-center justify-between text-xs text-foreground/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
