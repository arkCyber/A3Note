import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkspace } from '../useWorkspace';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

vi.mock('@tauri-apps/api/core');
vi.mock('@tauri-apps/plugin-dialog');

describe('useWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with empty workspace', () => {
    const { result } = renderHook(() => useWorkspace());

    expect(result.current.workspace.path).toBeNull();
    expect(result.current.workspace.files).toEqual([]);
    expect(result.current.workspace.loading).toBe(false);
    expect(result.current.workspace.error).toBeNull();
  });

  it('should load workspace from localStorage on mount', async () => {
    const mockPath = '/test/workspace';
    const mockFiles = [
      { path: '/test/workspace/file1.md', name: 'file1.md', isDirectory: false },
      { path: '/test/workspace/file2.md', name: 'file2.md', isDirectory: false },
    ];

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke).mockResolvedValueOnce(mockFiles);

    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspace.path).toBe(mockPath);
      expect(result.current.workspace.files).toEqual(mockFiles);
    });
  });

  it('should open workspace and load files', async () => {
    const mockPath = '/new/workspace';
    const mockFiles = [
      { path: '/new/workspace/note.md', name: 'note.md', isDirectory: false },
    ];
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem');

    vi.mocked(open).mockResolvedValueOnce(mockPath);
    vi.mocked(invoke).mockResolvedValueOnce(mockFiles);

    const { result } = renderHook(() => useWorkspace());

    await act(async () => {
      await result.current.openWorkspace();
    });

    await waitFor(() => {
      expect(result.current.workspace.path).toBe(mockPath);
      expect(result.current.workspace.files).toEqual(mockFiles);
      expect(setItemSpy).toHaveBeenCalledWith('workspacePath', mockPath);
    });
  });

  it('should handle workspace loading error', async () => {
    const mockPath = '/error/workspace';
    const errorMessage = 'Failed to load directory';

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspace.error).toContain(errorMessage);
      expect(result.current.workspace.loading).toBe(false);
    });
  });

  it('should refresh workspace', async () => {
    const mockPath = '/test/workspace';
    const initialFiles = [
      { path: '/test/workspace/file1.md', name: 'file1.md', isDirectory: false },
    ];
    const updatedFiles = [
      { path: '/test/workspace/file1.md', name: 'file1.md', isDirectory: false },
      { path: '/test/workspace/file2.md', name: 'file2.md', isDirectory: false },
    ];

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke)
      .mockResolvedValueOnce(initialFiles)
      .mockResolvedValueOnce(updatedFiles);

    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspace.files).toEqual(initialFiles);
    });

    await act(async () => {
      await result.current.refreshWorkspace();
    });

    await waitFor(() => {
      expect(result.current.workspace.files).toEqual(updatedFiles);
    });
  });

  it('should create file in workspace', async () => {
    const mockPath = '/test/workspace';
    const fileName = 'new-note.md';
    const mockFiles: any[] = [];

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke)
      .mockResolvedValueOnce(mockFiles) // Initial load
      .mockResolvedValueOnce(undefined) // Create file
      .mockResolvedValueOnce([ // Refresh after create
        { path: `${mockPath}/${fileName}`, name: fileName, isDirectory: false },
      ]);

    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspace.path).toBe(mockPath);
    });

    await act(async () => {
      await result.current.createFile(fileName, false);
    });

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('create_file', {
        path: `${mockPath}/${fileName}`,
        isDirectory: false,
      });
    });
  });

  it('should delete file from workspace', async () => {
    const mockPath = '/test/workspace';
    const filePath = '/test/workspace/to-delete.md';
    const initialFiles = [
      { path: filePath, name: 'to-delete.md', isDirectory: false },
    ];

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke)
      .mockResolvedValueOnce(initialFiles) // Initial load
      .mockResolvedValueOnce(undefined) // Delete file
      .mockResolvedValueOnce([]); // Refresh after delete

    const { result } = renderHook(() => useWorkspace());

    await waitFor(() => {
      expect(result.current.workspace.files).toEqual(initialFiles);
    });

    await act(async () => {
      await result.current.deleteFile(filePath);
    });

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('delete_file', { path: filePath });
      expect(result.current.workspace.files).toEqual([]);
    });
  });

  it('should not refresh if no workspace path', async () => {
    const { result } = renderHook(() => useWorkspace());

    await act(async () => {
      await result.current.refreshWorkspace();
    });

    expect(invoke).not.toHaveBeenCalled();
  });

  it('should handle concurrent operations safely', async () => {
    const mockPath = '/test/workspace';
    const mockFiles = [
      { path: '/test/workspace/file.md', name: 'file.md', isDirectory: false },
    ];

    localStorage.setItem('workspacePath', mockPath);
    vi.mocked(invoke).mockResolvedValue(mockFiles);

    const { result } = renderHook(() => useWorkspace());

    // Trigger multiple operations concurrently
    await act(async () => {
      await Promise.all([
        result.current.refreshWorkspace(),
        result.current.refreshWorkspace(),
        result.current.refreshWorkspace(),
      ]);
    });

    await waitFor(() => {
      expect(result.current.workspace.files).toEqual(mockFiles);
      expect(result.current.workspace.loading).toBe(false);
    });
  });
});
