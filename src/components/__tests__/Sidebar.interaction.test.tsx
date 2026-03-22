import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { FileItem } from '../../types';

describe('Sidebar Interactions', () => {
  const mockFiles: FileItem[] = [
    { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
    { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
    {
      path: '/test/folder',
      name: 'folder',
      isDirectory: true,
      children: [
        { path: '/test/folder/nested.md', name: 'nested.md', isDirectory: false },
      ],
    },
  ];

  const mockOnFileSelect = vi.fn();
  const mockOnDeleteFile = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mouse Interactions', () => {
    it('should handle single click on folder to expand/collapse', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const folder = screen.getByText('folder');
      fireEvent.click(folder);

      expect(screen.getByText('nested.md')).toBeInTheDocument();

      fireEvent.click(folder);
      expect(screen.queryByText('nested.md')).not.toBeInTheDocument();
    });

    it('should handle double-click on file to open', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByText('file1.md');
      fireEvent.doubleClick(file);

      expect(mockOnFileSelect).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('should handle double-click on folder to expand', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const folder = screen.getByText('folder');
      fireEvent.doubleClick(folder);

      expect(screen.getByText('nested.md')).toBeInTheDocument();
    });

    it('should show context menu on right-click', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByText('file1.md');
      fireEvent.contextMenu(file);

      expect(screen.getByText('contextMenu.open')).toBeInTheDocument();
      expect(screen.getByText('contextMenu.rename')).toBeInTheDocument();
      expect(screen.getByText('contextMenu.copyPath')).toBeInTheDocument();
      expect(screen.getAllByText('contextMenu.delete')[0]).toBeInTheDocument();
    });

    it('should show folder context menu on right-click folder', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const folder = screen.getByText('folder');
      fireEvent.contextMenu(folder);

      expect(screen.getByText('contextMenu.newFile')).toBeInTheDocument();
      expect(screen.getByText('contextMenu.newFolder')).toBeInTheDocument();
      expect(screen.getByText('contextMenu.rename')).toBeInTheDocument();
      expect(screen.getAllByText('contextMenu.delete')[0]).toBeInTheDocument();
    });

    it('should close context menu when clicking outside', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByText('file1.md');
      fireEvent.contextMenu(file);

      expect(screen.getByText('contextMenu.open')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('contextMenu.open')).not.toBeInTheDocument();
    });

    it('should execute context menu action and close menu', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByText('file1.md');
      fireEvent.contextMenu(file);

      const openButton = screen.getByText('contextMenu.open');
      fireEvent.click(openButton);

      expect(mockOnFileSelect).toHaveBeenCalledWith(mockFiles[0]);
      expect(screen.queryByText('contextMenu.open')).not.toBeInTheDocument();
    });

    it('should show hover effect on file items', () => {
      const { container } = render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const fileItem = container.querySelector('.hover\\:bg-background\\/50');
      expect(fileItem).toBeInTheDocument();
    });

    it('should highlight active file', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={mockFiles[0]}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByText('file1.md').closest('div');
      expect(file?.className).toContain('bg-primary/20');
    });
  });

  describe('Keyboard Interactions', () => {
    it('should be focusable with Tab key', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByLabelText('File: file1.md');
      expect(file).toHaveAttribute('tabIndex', '0');
    });

    it('should show focus indicator when focused', () => {
      const { container } = render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const focusableItem = container.querySelector('.focus-visible\\:ring-2');
      expect(focusableItem).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for files', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByLabelText('File: file1.md')).toBeInTheDocument();
      expect(screen.getByLabelText('File: file2.md')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for folders', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByLabelText('Folder: folder')).toBeInTheDocument();
    });

    it('should have role="button" for interactive elements', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const file = screen.getByLabelText('File: file1.md');
      expect(file).toHaveAttribute('role', 'button');
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button on hover', () => {
      const { container } = render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const deleteButton = container.querySelector('.group-hover\\:opacity-100');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should call onDeleteFile when delete button clicked', () => {
      render(
        <Sidebar
          files={mockFiles}
          currentFile={null}
          onFileSelect={mockOnFileSelect}
          onDeleteFile={mockOnDeleteFile}
          onRefresh={mockOnRefresh}
        />
      );

      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDeleteFile).toHaveBeenCalledWith('/test/file1.md');
    });
  });
});
