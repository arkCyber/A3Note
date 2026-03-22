import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFile } from '../useFile';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core');

describe('useFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with no file open', () => {
    const { result } = renderHook(() => useFile());

    expect(result.current.currentFile).toBeNull();
    expect(result.current.content).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it('should open file and load content', async () => {
    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };
    const mockContent = '# Test Note\n\nContent here';

    vi.mocked(invoke).mockResolvedValueOnce({
      path: mockFile.path,
      content: mockContent,
    });

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    await waitFor(() => {
      expect(result.current.currentFile).toEqual(mockFile);
      expect(result.current.content).toBe(mockContent);
      expect(result.current.isDirty).toBe(false);
    });
  });

  it('should not open directory', async () => {
    const mockDir = {
      path: '/test/folder',
      name: 'folder',
      isDirectory: true,
    };

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockDir);
    });

    expect(result.current.currentFile).toBeNull();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('should mark as dirty when content changes', async () => {
    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke).mockResolvedValueOnce({
      path: mockFile.path,
      content: 'Original content',
    });

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    act(() => {
      result.current.updateContent('Modified content');
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.content).toBe('Modified content');
  });

  it('should auto-save after 2 seconds', async () => {
    vi.useFakeTimers();

    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        path: mockFile.path,
        content: 'Original',
      })
      .mockResolvedValueOnce(undefined); // Save

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    act(() => {
      result.current.updateContent('Modified');
    });

    // Fast-forward 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
    });

    expect(invoke).toHaveBeenCalledWith('write_file_content', {
      path: mockFile.path,
      content: 'Modified',
    });
  });

  it('should debounce auto-save', async () => {
    vi.useFakeTimers();

    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke).mockResolvedValue({
      path: mockFile.path,
      content: 'Original',
    });

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    // Multiple rapid changes
    act(() => {
      result.current.updateContent('Change 1');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.updateContent('Change 2');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.updateContent('Change 3');
    });

    // Only the last change should be saved after 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
    });

    expect(invoke).toHaveBeenCalledWith('write_file_content', {
      path: mockFile.path,
      content: 'Change 3',
    });
  });

  it('should save file manually', async () => {
    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        path: mockFile.path,
        content: 'Original',
      })
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    act(() => {
      result.current.updateContent('Modified');
    });

    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.saveFile();
    });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('should handle save errors', async () => {
    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        path: mockFile.path,
        content: 'Original',
      })
      .mockRejectedValueOnce(new Error('Save failed'));

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    act(() => {
      result.current.updateContent('Modified');
    });

    await act(async () => {
      await result.current.saveFile();
    });

    await waitFor(() => {
      expect(result.current.error).toContain('Save failed');
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('should create new file', async () => {
    const newFilePath = '/test/new-note.md';

    vi.mocked(invoke)
      .mockResolvedValueOnce(undefined) // Create
      .mockResolvedValueOnce({ // Read
        path: newFilePath,
        content: '',
      });

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.createNewFile(newFilePath);
    });

    await waitFor(() => {
      expect(result.current.currentFile?.path).toBe(newFilePath);
      expect(result.current.content).toBe('');
    });
  });

  it('should close file and save if dirty', async () => {
    const mockFile = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce({
        path: mockFile.path,
        content: 'Original',
      })
      .mockResolvedValueOnce(undefined); // Save

    const { result } = renderHook(() => useFile());

    await act(async () => {
      await result.current.openFile(mockFile);
    });

    act(() => {
      result.current.updateContent('Modified');
    });

    await act(async () => {
      await result.current.closeFile();
    });

    await waitFor(() => {
      expect(result.current.currentFile).toBeNull();
      expect(result.current.content).toBe('');
      expect(result.current.isDirty).toBe(false);
    });
  });
});
