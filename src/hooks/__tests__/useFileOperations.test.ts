import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileOperations } from '../useFileOperations';
import { FileItem } from '../../types';

describe('useFileOperations', () => {
  const mockFile: FileItem = {
    path: '/test/file.md',
    name: 'file.md',
    isDirectory: false,
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock window.alert
    global.alert = vi.fn();
  });

  it('should initialize with empty starred files', () => {
    const { result } = renderHook(() => useFileOperations());
    
    expect(result.current.starredFiles.size).toBe(0);
  });

  it('should star a file', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.toggleStar(mockFile.path);
    });

    expect(result.current.isStarred(mockFile.path)).toBe(true);
  });

  it('should unstar a file', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.toggleStar(mockFile.path);
    });

    expect(result.current.isStarred(mockFile.path)).toBe(true);

    act(() => {
      result.current.toggleStar(mockFile.path);
    });

    expect(result.current.isStarred(mockFile.path)).toBe(false);
  });

  it('should copy file path to clipboard', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.copyPath(mockFile.path);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockFile.path);
  });

  it('should copy Obsidian URL', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.copyObsidianURL(mockFile);
    });

    const expectedUrl = `obsidian://open?vault=A3Note&file=${encodeURIComponent(mockFile.path)}`;
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
  });

  it('should show in explorer', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.showInExplorer(mockFile.path);
    });

    expect(global.alert).toHaveBeenCalled();
  });

  it('should open in new tab', () => {
    const { result } = renderHook(() => useFileOperations());
    const mockOnFileSelect = vi.fn();
    
    act(() => {
      result.current.openInNewTab(mockFile, mockOnFileSelect);
    });

    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it('should open in new window', () => {
    const { result } = renderHook(() => useFileOperations());
    
    act(() => {
      result.current.openInNewWindow(mockFile);
    });

    expect(global.alert).toHaveBeenCalled();
  });

  it('should open to right', () => {
    const { result } = renderHook(() => useFileOperations());
    const mockOnFileSelect = vi.fn();
    
    act(() => {
      result.current.openToRight(mockFile, mockOnFileSelect);
    });

    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it('should get file properties', () => {
    const { result } = renderHook(() => useFileOperations());
    
    const props = result.current.getFileProperties(mockFile.path);
    
    // Should return null if no properties set
    expect(props).toBeNull();
  });
});
