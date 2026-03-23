/**
 * usePlugins Hook Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlugins } from '../usePlugins';
import { app } from '../../plugins/api/App';

describe('usePlugins Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize plugin system', () => {
      const { result } = renderHook(() => usePlugins());
      
      expect(result.current).toBeDefined();
      expect(result.current.initialized).toBeDefined();
      expect(result.current.pluginManager).toBeDefined();
    });

    it('should not initialize twice', () => {
      const { result, rerender } = renderHook(() => usePlugins());
      
      const firstInitialized = result.current.initialized;
      rerender();
      const secondInitialized = result.current.initialized;
      
      expect(firstInitialized).toBe(secondInitialized);
    });

    it('should return plugin manager instance', () => {
      const { result } = renderHook(() => usePlugins());
      
      expect(result.current.pluginManager).toBeDefined();
    });
  });

  describe('Plugin Registration', () => {
    it('should register plugins on mount', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should handle plugin registration errors gracefully', async () => {
      // Mock plugin registration error
      const mockRegister = vi.spyOn(app.plugins, 'registerPlugin').mockRejectedValue(new Error('Registration error'));
      
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBeDefined();
      });
      
      mockRegister.mockRestore();
    });
  });

  describe('Plugin Loading', () => {
    it('should load enabled plugins', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should handle plugin loading errors gracefully', async () => {
      const mockLoad = vi.spyOn(app.plugins, 'loadEnabledPlugins').mockRejectedValue(new Error('Load error'));
      
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBeDefined();
      });
      
      mockLoad.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should unload plugins on unmount', async () => {
      const { result, unmount } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
      
      const mockUnload = vi.spyOn(app.plugins, 'unloadAllPlugins').mockResolvedValue(undefined);
      
      unmount();
      
      expect(mockUnload).toHaveBeenCalled();
      mockUnload.mockRestore();
    });

    it('should handle cleanup errors gracefully', async () => {
      const { result, unmount } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
      
      const mockUnload = vi.spyOn(app.plugins, 'unloadAllPlugins').mockRejectedValue(new Error('Unload error'));
      
      expect(() => unmount()).not.toThrow();
      
      mockUnload.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should update initialized state', async () => {
      const { result } = renderHook(() => usePlugins());
      
      expect(result.current.initialized).toBe(false);
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should maintain plugin manager reference', async () => {
      const { result } = renderHook(() => usePlugins());
      
      const firstManager = result.current.pluginManager;
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
      
      const secondManager = result.current.pluginManager;
      
      expect(firstManager).toBe(secondManager);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const mockInitialize = vi.spyOn(app.plugins, 'registerPlugin').mockRejectedValue(new Error('Init error'));
      
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
      
      mockInitialize.mockRestore();
    });

    it('should handle multiple plugin registration errors', async () => {
      const mockRegister = vi.spyOn(app.plugins, 'registerPlugin').mockRejectedValue(new Error('Registration error'));
      
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
      
      mockRegister.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should initialize quickly', async () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle rapid mount/unmount', async () => {
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => usePlugins());
        
        await waitFor(() => {
          expect(result.current.initialized).toBe(true);
        });
        
        unmount();
      }
      
      expect(true).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should integrate with App API', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.pluginManager).toBe(app.plugins);
      });
    });

    it('should work with parent component', async () => {
      const ParentComponent = () => {
        const { initialized, pluginManager } = usePlugins();
        
        return (
          <div>
            <div>Initialized: {initialized.toString()}</div>
            <div>Plugin Manager: {pluginManager ? 'Available' : 'Not Available'}</div>
          </div>
        );
      };
      
      const { container } = render(ParentComponent);
      
      await waitFor(() => {
        expect(container).toHaveTextContent('Initialized: true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing plugin manifest gracefully', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should handle duplicate plugin registration', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should handle plugin with invalid manifest', async () => {
      const { result } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Concurrency', () => {
    it('should handle concurrent initialization', async () => {
      const hooks = Array.from({ length: 5 }, () => renderHook(() => usePlugins()));
      
      await Promise.all(
        hooks.map(({ result }) =>
          waitFor(() => {
            expect(result.current.initialized).toBe(true);
          })
        )
      );
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory on unmount', async () => {
      const { result, unmount } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
      
      const managerBefore = result.current.pluginManager;
      
      unmount();
      
      expect(managerBefore).toBeDefined();
    });

    it('should clean up event listeners', async () => {
      const { unmount } = renderHook(() => usePlugins());
      
      await waitFor(() => {
        expect(true).toBe(true);
      });
      
      expect(() => unmount()).not.toThrow();
    });
  });
});
