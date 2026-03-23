/**
 * Integration Tests - Aerospace-Grade
 * Tests for component integration and complete workflows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock Tauri API
vi.mock('@tauri-apps/api/dialog', () => ({
  open: vi.fn().mockResolvedValue('/mock/workspace'),
}));

vi.mock('@tauri-apps/api/fs', () => ({
  readDir: vi.fn().mockResolvedValue([
    { name: 'test.md', path: '/mock/workspace/test.md', children: null },
  ]),
  readTextFile: vi.fn().mockResolvedValue('# Test Content'),
  writeTextFile: vi.fn().mockResolvedValue(undefined),
  createDir: vi.fn().mockResolvedValue(undefined),
  removeFile: vi.fn().mockResolvedValue(undefined),
  renameFile: vi.fn().mockResolvedValue(undefined),
}));

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('App Initialization', () => {
    it('should render welcome screen when no workspace loaded', () => {
      render(<App />);
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('should load workspace and show file tree', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
    });
  });

  describe('File Operations Workflow', () => {
    it('should create, open, edit, and save a file', async () => {
      render(<App />);
      
      // 1. Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // 2. Create new file
      const newFileBtn = screen.getByTitle('contextMenu.newFile');
      fireEvent.click(newFileBtn);
      
      await waitFor(() => {
        expect(screen.getByText(/未命名/)).toBeInTheDocument();
      });
      
      // 3. Edit content
      const editor = screen.getByRole('textbox');
      fireEvent.change(editor, { target: { value: '# New Content' } });
      
      // 4. Save file
      fireEvent.keyDown(editor, { key: 's', metaKey: true });
      
      await waitFor(() => {
        expect(screen.queryByText('●')).not.toBeInTheDocument(); // Dirty indicator gone
      });
    });

    it('should delete a file and remove from tree', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Right-click file
      const file = screen.getByText('test.md');
      fireEvent.contextMenu(file);
      
      // Click delete
      const deleteBtn = screen.getByText('contextMenu.delete');
      fireEvent.click(deleteBtn);
      
      // Confirm
      window.confirm = vi.fn(() => true);
      
      await waitFor(() => {
        expect(screen.queryByText('test.md')).not.toBeInTheDocument();
      });
    });

    it('should rename a file', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Right-click file
      const file = screen.getByText('test.md');
      fireEvent.contextMenu(file);
      
      // Click rename
      const renameBtn = screen.getByText('contextMenu.rename');
      fireEvent.click(renameBtn);
      
      // Enter new name
      window.prompt = vi.fn(() => 'renamed.md');
      
      await waitFor(() => {
        expect(screen.getByText('renamed.md')).toBeInTheDocument();
      });
    });
  });

  describe('Search Workflow', () => {
    it('should search and open file from results', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Open search
      fireEvent.keyDown(document, { key: 'f', metaKey: true, shiftKey: true });
      
      // Search for file
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Click result
      const result = screen.getByText('test.md');
      fireEvent.click(result);
      
      // File should open in editor
      await waitFor(() => {
        expect(screen.getByText(/Test Content/)).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Search Workflow', () => {
    it('should filter files in sidebar when searching', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Focus search in sidebar
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
      
      const sidebarSearch = screen.getByPlaceholderText(/搜索文件/);
      fireEvent.change(sidebarSearch, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
    });

    it('should highlight search matches', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Search
      const sidebarSearch = screen.getByPlaceholderText(/搜索文件/);
      fireEvent.change(sidebarSearch, { target: { value: 'test' } });
      
      await waitFor(() => {
        const marks = document.querySelectorAll('mark');
        expect(marks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should toggle sidebar with Cmd+B', async () => {
      render(<App />);
      
      // Open workspace first
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Toggle sidebar
      fireEvent.keyDown(document, { key: 'b', metaKey: true });
      
      await waitFor(() => {
        expect(screen.queryByText('test.md')).not.toBeInTheDocument();
      });
      
      // Toggle back
      fireEvent.keyDown(document, { key: 'b', metaKey: true });
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
    });

    it('should open command palette with Cmd+P', async () => {
      render(<App />);
      
      fireEvent.keyDown(document, { key: 'p', metaKey: true });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search commands/i)).toBeInTheDocument();
      });
    });

    it('should create new file with Cmd+N', async () => {
      render(<App />);
      
      // Open workspace first
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Create new file
      fireEvent.keyDown(document, { key: 'n', metaKey: true });
      
      await waitFor(() => {
        expect(screen.getByText(/未命名/)).toBeInTheDocument();
      });
    });
  });

  describe('Editor Integration', () => {
    it('should render markdown with live preview', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Open file
      const file = screen.getByText('test.md');
      fireEvent.click(file);
      
      await waitFor(() => {
        // Check if markdown is rendered
        const editor = document.querySelector('.cm-editor');
        expect(editor).toBeInTheDocument();
      });
    });

    it('should show dirty indicator when editing', async () => {
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Open file
      const file = screen.getByText('test.md');
      fireEvent.click(file);
      
      // Edit content
      const editor = screen.getByRole('textbox');
      fireEvent.change(editor, { target: { value: '# Modified' } });
      
      await waitFor(() => {
        expect(screen.getByText('●')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      const { readTextFile } = await import('@tauri-apps/api/fs');
      vi.mocked(readTextFile).mockRejectedValueOnce(new Error('Read failed'));
      
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Try to open file
      const file = screen.getByText('test.md');
      fireEvent.click(file);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      const { writeTextFile } = await import('@tauri-apps/api/fs');
      vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('Write failed'));
      
      render(<App />);
      
      // Open workspace
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('test.md')).toBeInTheDocument();
      });
      
      // Open file
      const file = screen.getByText('test.md');
      fireEvent.click(file);
      
      // Edit and try to save
      const editor = screen.getByRole('textbox');
      fireEvent.change(editor, { target: { value: '# Modified' } });
      fireEvent.keyDown(editor, { key: 's', metaKey: true });
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('●')).toBeInTheDocument(); // Still dirty
      });
    });
  });

  describe('Performance', () => {
    it('should handle large file tree efficiently', async () => {
      const { readDir } = await import('@tauri-apps/api/fs');
      const largeTree = Array.from({ length: 1000 }, (_, i) => ({
        name: `file${i}.md`,
        path: `/mock/workspace/file${i}.md`,
        children: null,
      }));
      vi.mocked(readDir).mockResolvedValueOnce(largeTree);
      
      const startTime = performance.now();
      render(<App />);
      
      const openBtn = screen.getByText(/open workspace/i);
      fireEvent.click(openBtn);
      
      await waitFor(() => {
        expect(screen.getByText('file0.md')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Should render in reasonable time (< 2000ms)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
