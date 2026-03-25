/**
 * Quick Switcher Hook - Aerospace-grade integration
 * DO-178C Level A
 * React hook for quick switcher functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { getQuickSwitcherService, QuickSwitcherResult } from '../services/QuickSwitcherService';
import { FileItem } from '../types';

export interface UseQuickSwitcherOptions {
  files: FileItem[];
  onSelectFile: (file: FileItem) => void;
}

export function useQuickSwitcher({ files, onSelectFile }: UseQuickSwitcherOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<QuickSwitcherResult[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  
  const service = getQuickSwitcherService();

  // Initialize service with files
  useEffect(() => {
    service.setFiles(files);
  }, [files]);

  // Load recent files
  useEffect(() => {
    setRecentFiles(service.getRecentFiles());
  }, []);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    const searchResults = service.search(query, {
      maxResults: 50,
      fuzzyMatch: true,
    });
    setResults(searchResults);
  }, []);

  // Open handler
  const open = useCallback(() => {
    setIsOpen(true);
    handleSearch(''); // Load recent files
  }, [handleSearch]);

  // Close handler
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Select file handler
  const handleSelectFile = useCallback((file: FileItem) => {
    service.addToRecent(file.path);
    setRecentFiles(service.getRecentFiles());
    onSelectFile(file);
    close();
  }, [onSelectFile, close]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return {
    isOpen,
    results,
    recentFiles,
    open,
    close,
    handleSearch,
    handleSelectFile,
  };
}
