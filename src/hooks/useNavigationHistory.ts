/**
 * Navigation History Hook - Aerospace-grade integration
 * DO-178C Level A
 * React hook for navigation history functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { getNavigationHistoryService, NavigationEntry } from '../services/NavigationHistoryService';

export interface UseNavigationHistoryOptions {
  onNavigate: (entry: NavigationEntry) => void;
}

export function useNavigationHistory({ onNavigate }: UseNavigationHistoryOptions) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [backHistory, setBackHistory] = useState<NavigationEntry[]>([]);
  const [forwardHistory, setForwardHistory] = useState<NavigationEntry[]>([]);

  const service = getNavigationHistoryService();

  // Update state
  const updateState = useCallback(() => {
    setCanGoBack(service.canGoBack());
    setCanGoForward(service.canGoForward());
    setBackHistory(service.getBackHistory());
    setForwardHistory(service.getForwardHistory());
  }, []);

  // Push entry
  const push = useCallback((filePath: string, position?: { line: number; column: number }) => {
    service.push({ filePath, position });
    updateState();
  }, [updateState]);

  // Go back
  const back = useCallback(() => {
    const entry = service.back();
    if (entry) {
      onNavigate(entry);
      updateState();
    }
  }, [onNavigate, updateState]);

  // Go forward
  const forward = useCallback(() => {
    const entry = service.forward();
    if (entry) {
      onNavigate(entry);
      updateState();
    }
  }, [onNavigate, updateState]);

  // Jump to index
  const jumpTo = useCallback((index: number) => {
    const entry = service.jumpTo(index);
    if (entry) {
      onNavigate(entry);
      updateState();
    }
  }, [onNavigate, updateState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          back();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          forward();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [back, forward]);

  // Initialize state
  useEffect(() => {
    updateState();
  }, [updateState]);

  return {
    canGoBack,
    canGoForward,
    backHistory,
    forwardHistory,
    push,
    back,
    forward,
    jumpTo,
  };
}
