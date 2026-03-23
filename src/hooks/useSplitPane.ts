import { useState, useCallback } from 'react';
import { log } from '../utils/logger';

/**
 * Hook for split pane management
 * 
 * @aerospace-grade
 */

export interface SplitPaneState {
  isEnabled: boolean;
  size: number;
  direction: 'horizontal' | 'vertical';
}

export function useSplitPane(defaultSize = 50) {
  const [state, setState] = useState<SplitPaneState>({
    isEnabled: false,
    size: defaultSize,
    direction: 'horizontal',
  });

  const enableSplit = useCallback((direction: 'horizontal' | 'vertical' = 'horizontal') => {
    setState(prev => ({
      ...prev,
      isEnabled: true,
      direction,
    }));
    log.info('[useSplitPane] Split enabled', { direction });
  }, []);

  const disableSplit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEnabled: false,
    }));
    log.info('[useSplitPane] Split disabled');
  }, []);

  const toggleSplit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
    log.info('[useSplitPane] Split toggled');
  }, []);

  const setSize = useCallback((size: number) => {
    setState(prev => ({
      ...prev,
      size,
    }));
  }, []);

  const setDirection = useCallback((direction: 'horizontal' | 'vertical') => {
    setState(prev => ({
      ...prev,
      direction,
    }));
    log.info('[useSplitPane] Direction changed', { direction });
  }, []);

  return {
    ...state,
    enableSplit,
    disableSplit,
    toggleSplit,
    setSize,
    setDirection,
  };
}
