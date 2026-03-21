import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from '../useSearch';
import * as tauriApi from '../../api/tauri';

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: {
    searchFiles: vi.fn(),
  },
}));

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should perform search when search is called', async () => {
    const mockResults = [
      {
        path: '/test/file1.md',
        line: 1,
        column: 5,
        snippet: 'test content',
      },
      {
        path: '/test/file2.md',
        line: 3,
        column: 10,
        snippet: 'another test',
      },
    ];

    vi.spyOn(tauriApi.tauriApi, 'searchFiles').mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    await act(async () => {
      await result.current.search('test');
    });

    await waitFor(() => {
      expect(result.current.query).toBe('test');
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(tauriApi.tauriApi.searchFiles).toHaveBeenCalledWith('/test/workspace', 'test');
  });

  it('should set isSearching to true during search', async () => {
    vi.spyOn(tauriApi.tauriApi, 'searchFiles').mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    act(() => {
      result.current.search('test');
    });

    expect(result.current.isSearching).toBe(true);

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('should not search with empty query', async () => {
    const searchSpy = vi.spyOn(tauriApi.tauriApi, 'searchFiles');
    
    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    await act(async () => {
      await result.current.search('');
    });

    expect(searchSpy).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.query).toBe('');
  });

  it('should handle search errors gracefully', async () => {
    const errorMessage = 'Search failed';
    vi.spyOn(tauriApi.tauriApi, 'searchFiles').mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    await act(async () => {
      await result.current.search('test');
    });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should clear search results', () => {
    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle null workspace path', async () => {
    const searchSpy = vi.spyOn(tauriApi.tauriApi, 'searchFiles');
    
    const { result } = renderHook(() => useSearch(null));
    
    await act(async () => {
      await result.current.search('test');
    });

    expect(searchSpy).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('should update query and results when search is called', async () => {
    const mockResults = [{ path: '/test.md', line: 1, column: 0, snippet: 'test' }];
    vi.spyOn(tauriApi.tauriApi, 'searchFiles').mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    await act(async () => {
      await result.current.search('first search');
    });

    expect(result.current.query).toBe('first search');

    await act(async () => {
      await result.current.search('second search');
    });

    await waitFor(() => {
      expect(result.current.query).toBe('second search');
    });

    expect(tauriApi.tauriApi.searchFiles).toHaveBeenLastCalledWith('/test/workspace', 'second search');
  });

  it('should trim whitespace from query', async () => {
    const searchSpy = vi.spyOn(tauriApi.tauriApi, 'searchFiles');
    
    const { result } = renderHook(() => useSearch('/test/workspace'));
    
    await act(async () => {
      await result.current.search('   ');
    });

    expect(searchSpy).not.toHaveBeenCalled();
  });
});
