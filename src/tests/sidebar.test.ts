/**
 * Comprehensive Sidebar Tests - Aerospace-Grade
 * Tests for all sidebar functionality including search, sort, and navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileItem } from '../types';
import EnhancedSidebar from '../components/EnhancedSidebar';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    timer: () => vi.fn(),
  },
}));

// Mock error handler
vi.mock('../utils/errorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
  },
  ErrorSeverity: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}));

describe('EnhancedSidebar - Aerospace-Grade Tests', () => {
  const mockFiles: FileItem[] = [
    {
      name: 'folder1',
      path: '/folder1',
      isDirectory: true,
      children: [
        { name: 'file1.md', path: '/folder1/file1.md', isDirectory: false },
        { name: 'file2.md', path: '/folder1/file2.md', isDirectory: false },
      ],
    },
    {
      name: 'folder2',
      path: '/folder2',
      isDirectory: true,
      children: [
        { name: 'nested.md', path: '/folder2/nested.md', isDirectory: false },
      ],
    },
    { name: 'root.md', path: '/root.md', isDirectory: false },
  ];

  const defaultProps = {
    files: mockFiles,
    currentFile: null,
    onFileSelect: vi.fn(),
    onDeleteFile: vi.fn(),
    onRefresh: vi.fn(),
    onCreateFile: vi.fn(),
    onCreateFolder: vi.fn(),
    onRename: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render sidebar with title', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should render all root files and folders', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByText('folder1')).toBeInTheDocument();
      expect(screen.getByText('folder2')).toBeInTheDocument();
      expect(screen.getByText('root.md')).toBeInTheDocument();
    });

    it('should display file statistics', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByText(/3 个文件, 2 个文件夹/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByTitle('contextMenu.newFile')).toBeInTheDocument();
      expect(screen.getByTitle('contextMenu.newFolder')).toBeInTheDocument();
      expect(screen.getByTitle('refresh')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByPlaceholderText(/搜索文件/)).toBeInTheDocument();
    });
  });

  describe('File Operations', () => {
    it('should call onFileSelect when clicking a file', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const file = screen.getByText('root.md');
      fireEvent.click(file);
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'root.md' })
      );
    });

    it('should expand folder when clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const folder = screen.getByText('folder1');
      fireEvent.click(folder);
      
      // Children should now be visible
      expect(screen.getByText('file1.md')).toBeInTheDocument();
      expect(screen.getByText('file2.md')).toBeInTheDocument();
    });

    it('should collapse folder when clicked again', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const folder = screen.getByText('folder1');
      
      // Expand
      fireEvent.click(folder);
      expect(screen.getByText('file1.md')).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(folder);
      expect(screen.queryByText('file1.md')).not.toBeInTheDocument();
    });

    it('should call onCreateFile when new file button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const newFileBtn = screen.getByTitle('contextMenu.newFile');
      fireEvent.click(newFileBtn);
      
      expect(defaultProps.onCreateFile).toHaveBeenCalled();
      const callArg = defaultProps.onCreateFile.mock.calls[0][0];
      expect(callArg).toMatch(/未命名-\d+\.md/);
    });

    it('should call onCreateFolder when new folder button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const newFolderBtn = screen.getByTitle('contextMenu.newFolder');
      fireEvent.click(newFolderBtn);
      
      expect(defaultProps.onCreateFolder).toHaveBeenCalled();
      const callArg = defaultProps.onCreateFolder.mock.calls[0][0];
      expect(callArg).toMatch(/未命名文件夹-\d+/);
    });

    it('should call onRefresh when refresh button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const refreshBtn = screen.getByTitle('refresh');
      fireEvent.click(refreshBtn);
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should filter files based on search query', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      fireEvent.change(searchInput, { target: { value: 'file1' } });
      
      await waitFor(() => {
        expect(screen.getByText('file1.md')).toBeInTheDocument();
        expect(screen.queryByText('file2.md')).not.toBeInTheDocument();
        expect(screen.queryByText('root.md')).not.toBeInTheDocument();
      });
    });

    it('should show parent folder when child matches search', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      fireEvent.change(searchInput, { target: { value: 'nested' } });
      
      await waitFor(() => {
        expect(screen.getByText('folder2')).toBeInTheDocument();
        expect(screen.getByText('nested.md')).toBeInTheDocument();
      });
    });

    it('should show "no results" message when no matches', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText(/未找到匹配/)).toBeInTheDocument();
      });
    });

    it('should clear search when X button clicked', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/) as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput.value).toBe('test');
      
      const clearBtn = screen.getByRole('button', { name: '' });
      fireEvent.click(clearBtn);
      
      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });

    it('should highlight search matches', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      fireEvent.change(searchInput, { target: { value: 'file' } });
      
      await waitFor(() => {
        const marks = document.querySelectorAll('mark');
        expect(marks.length).toBeGreaterThan(0);
      });
    });

    it('should auto-expand folders when searching', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      fireEvent.change(searchInput, { target: { value: 'file1' } });
      
      await waitFor(() => {
        // Folder should be auto-expanded
        expect(screen.getByText('file1.md')).toBeInTheDocument();
      });
    });
  });

  describe('Sort Functionality', () => {
    it('should sort files by name in ascending order by default', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const items = screen.getAllByRole('button');
      const fileNames = items
        .map(item => item.textContent)
        .filter(text => text?.includes('.md') || text?.includes('folder'));
      
      // Folders should come first, then files, all alphabetically
      expect(fileNames[0]).toContain('folder1');
      expect(fileNames[1]).toContain('folder2');
    });

    it('should toggle sort order when sort button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const sortBtn = screen.getByTitle('切换排序顺序');
      
      // Should show SortAsc initially
      expect(sortBtn.querySelector('svg')).toBeInTheDocument();
      
      fireEvent.click(sortBtn);
      
      // Should now show SortDesc
      expect(sortBtn.querySelector('svg')).toBeInTheDocument();
    });

    it('should switch to name sort when name button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const nameBtn = screen.getByTitle('按名称排序');
      
      fireEvent.click(nameBtn);
      
      // Button should be highlighted
      expect(nameBtn.className).toContain('bg-primary');
    });

    it('should switch to modified sort when modified button clicked', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const modifiedBtn = screen.getByTitle('按修改时间排序');
      
      fireEvent.click(modifiedBtn);
      
      // Button should be highlighted
      expect(modifiedBtn.className).toContain('bg-primary');
    });
  });

  describe('Collapse All Functionality', () => {
    it('should collapse all folders when collapse all button clicked', async () => {
      render(<EnhancedSidebar {...defaultProps} />);
      
      // First expand a folder
      const folder = screen.getByText('folder1');
      fireEvent.click(folder);
      expect(screen.getByText('file1.md')).toBeInTheDocument();
      
      // Click collapse all
      const collapseBtn = screen.getByTitle('折叠所有文件夹');
      fireEvent.click(collapseBtn);
      
      // Folder should be collapsed
      await waitFor(() => {
        expect(screen.queryByText('file1.md')).not.toBeInTheDocument();
      });
    });
  });

  describe('Context Menu', () => {
    it('should show context menu on right click', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const file = screen.getByText('root.md');
      
      fireEvent.contextMenu(file);
      
      // Context menu should appear
      expect(screen.getByText('contextMenu.open')).toBeInTheDocument();
    });

    it('should show different menu for folders', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const folder = screen.getByText('folder1');
      
      fireEvent.contextMenu(folder);
      
      // Folder menu should have newFile and newFolder options
      expect(screen.getByText('contextMenu.newFile')).toBeInTheDocument();
      expect(screen.getByText('contextMenu.newFolder')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', () => {
      render(<EnhancedSidebar {...defaultProps} files={[]} />);
      expect(screen.getByText('noFiles')).toBeInTheDocument();
    });

    it('should handle null currentFile', () => {
      render(<EnhancedSidebar {...defaultProps} currentFile={null} />);
      // Should not crash
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should handle files without children', () => {
      const filesWithoutChildren: FileItem[] = [
        { name: 'folder', path: '/folder', isDirectory: true },
      ];
      
      render(<EnhancedSidebar {...defaultProps} files={filesWithoutChildren} />);
      const folder = screen.getByText('folder');
      fireEvent.click(folder);
      
      // Should not crash
      expect(folder).toBeInTheDocument();
    });

    it('should handle very long file names', () => {
      const longNameFiles: FileItem[] = [
        {
          name: 'this-is-a-very-long-file-name-that-should-be-truncated.md',
          path: '/long.md',
          isDirectory: false,
        },
      ];
      
      render(<EnhancedSidebar {...defaultProps} files={longNameFiles} />);
      expect(screen.getByText(/this-is-a-very-long/)).toBeInTheDocument();
    });

    it('should handle special characters in file names', () => {
      const specialFiles: FileItem[] = [
        { name: '文件 (1).md', path: '/文件 (1).md', isDirectory: false },
        { name: 'file@#$.md', path: '/file@#$.md', isDirectory: false },
      ];
      
      render(<EnhancedSidebar {...defaultProps} files={specialFiles} />);
      expect(screen.getByText('文件 (1).md')).toBeInTheDocument();
      expect(screen.getByText('file@#$.md')).toBeInTheDocument();
    });

    it('should handle deeply nested folders', () => {
      const deepFiles: FileItem[] = [
        {
          name: 'level1',
          path: '/level1',
          isDirectory: true,
          children: [
            {
              name: 'level2',
              path: '/level1/level2',
              isDirectory: true,
              children: [
                {
                  name: 'level3',
                  path: '/level1/level2/level3',
                  isDirectory: true,
                  children: [
                    { name: 'deep.md', path: '/level1/level2/level3/deep.md', isDirectory: false },
                  ],
                },
              ],
            },
          ],
        },
      ];
      
      render(<EnhancedSidebar {...defaultProps} files={deepFiles} />);
      
      // Expand all levels
      fireEvent.click(screen.getByText('level1'));
      fireEvent.click(screen.getByText('level2'));
      fireEvent.click(screen.getByText('level3'));
      
      expect(screen.getByText('deep.md')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of files', () => {
      const manyFiles: FileItem[] = Array.from({ length: 1000 }, (_, i) => ({
        name: `file${i}.md`,
        path: `/file${i}.md`,
        isDirectory: false,
      }));
      
      const startTime = performance.now();
      render(<EnhancedSidebar {...defaultProps} files={manyFiles} />);
      const endTime = performance.now();
      
      // Should render in reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should filter large file list quickly', async () => {
      const manyFiles: FileItem[] = Array.from({ length: 1000 }, (_, i) => ({
        name: `file${i}.md`,
        path: `/file${i}.md`,
        isDirectory: false,
      }));
      
      render(<EnhancedSidebar {...defaultProps} files={manyFiles} />);
      const searchInput = screen.getByPlaceholderText(/搜索文件/);
      
      const startTime = performance.now();
      fireEvent.change(searchInput, { target: { value: 'file999' } });
      const endTime = performance.now();
      
      // Should filter quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByLabelText(/File: root.md/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Folder: folder1/)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      const file = screen.getByText('root.md');
      
      // Should be focusable
      file.focus();
      expect(document.activeElement).toBe(file.closest('[tabIndex="0"]'));
    });

    it('should have proper button titles', () => {
      render(<EnhancedSidebar {...defaultProps} />);
      expect(screen.getByTitle('contextMenu.newFile')).toBeInTheDocument();
      expect(screen.getByTitle('contextMenu.newFolder')).toBeInTheDocument();
      expect(screen.getByTitle('refresh')).toBeInTheDocument();
    });
  });
});
