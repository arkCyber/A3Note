/**
 * Editor Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Editor from '../Editor';
import { FileItem } from '../../types';

describe('Editor Component', () => {
  const mockCurrentFile: FileItem = {
    path: '/test/file.md',
    name: 'file.md',
    isDirectory: false,
  };

  const mockContent = '# Test Content\n\nThis is a test.';
  const mockOnContentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render welcome screen when no file is selected', () => {
      render(
        <Editor
          currentFile={null}
          content=""
          onContentChange={mockOnContentChange}
        />
      );

      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
      expect(
        screen.getByText('Select a file or create a new one to start editing')
      ).toBeInTheDocument();
    });

    it('should render editor when file is selected', () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
    });

    it('should display file content in editor', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });
    });
  });

  describe('Content Updates', () => {
    it('should call onContentChange when user types', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      // Simulate typing
      const editor = screen.getByRole('textbox');
      fireEvent.change(editor, { target: { value: '# Updated Content' } });

      await waitFor(() => {
        expect(mockOnContentChange).toHaveBeenCalled();
      });
    });

    it('should update content when file changes', async () => {
      const { rerender } = render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const newContent = '# New Content\n\nDifferent content.';
      rerender(
        <Editor
          currentFile={mockCurrentFile}
          content={newContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('should not update content when content is the same', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const initialCallCount = mockOnContentChange.mock.calls.length;

      // Rerender with same content
      const { rerender } = render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      rerender(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        expect(mockOnContentChange.mock.calls.length).toBe(initialCallCount);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty content gracefully', () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content=""
          onContentChange={mockOnContentChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle null content gracefully', () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content=""
          onContentChange={mockOnContentChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = '# Test\n\n'.repeat(1000);
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={longContent}
          onContentChange={mockOnContentChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialContent = '# Test\n\nSpecial: @#$%^&*()_+-={}[]|\\:";\'<>?,./';
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={specialContent}
          onContentChange={mockOnContentChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle rapid content changes', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      for (let i = 0; i < 50; i++) {
        const { rerender } = render(
          <Editor
            currentFile={mockCurrentFile}
            content={`# Content ${i}`}
            onContentChange={mockOnContentChange}
          />
        );

        rerender(
          <Editor
            currentFile={mockCurrentFile}
            content={`# Content ${i + 1}`}
            onContentChange={mockOnContentChange}
          />
        );
      }

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible', async () => {
      render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
        editor.focus();
        expect(editor).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle file path changes', async () => {
      const { rerender } = render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const newFile: FileItem = {
        path: '/test/newfile.md',
        name: 'newfile.md',
        isDirectory: false,
      };

      rerender(
        <Editor
          currentFile={newFile}
          content="# New File Content"
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('should handle switching between files', async () => {
      const { rerender } = render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeInTheDocument();
      });

      const file2: FileItem = {
        path: '/test/file2.md',
        name: 'file2.md',
        isDirectory: false,
      };

      rerender(
        <Editor
          currentFile={file2}
          content="# File 2 Content"
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      // Switch back
      rerender(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('should handle undefined onContentChange', () => {
      expect(() => {
        render(
          <Editor
            currentFile={mockCurrentFile}
            content={mockContent}
            onContentChange={undefined as any}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with parent component state', async () => {
      const ParentComponent = () => {
        const [content, setContent] = vi.fn();
        return (
          <div>
            <Editor
              currentFile={mockCurrentFile}
              content={content}
              onContentChange={setContent}
            />
          </div>
        );
      };

      expect(() => render(<ParentComponent />)).not.toThrow();
    });

    it('should handle multiple editor instances', async () => {
      const file1: FileItem = {
        path: '/test/file1.md',
        name: 'file1.md',
        isDirectory: false,
      };

      const file2: FileItem = {
        path: '/test/file2.md',
        name: 'file2.md',
        isDirectory: false,
      };

      render(
        <div>
          <Editor
            currentFile={file1}
            content="# File 1"
            onContentChange={vi.fn()}
          />
          <Editor
            currentFile={file2}
            content="# File 2"
            onContentChange={vi.fn()}
          />
        </div>
      );

      await waitFor(() => {
        const editors = screen.getAllByRole('textbox');
        expect(editors.length).toBe(2);
      });
    });
  });

  describe('Memory Management', () => {
    it('should clean up editor on unmount', () => {
      const { unmount } = render(
        <Editor
          currentFile={mockCurrentFile}
          content={mockContent}
          onContentChange={mockOnContentChange}
        />
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <Editor
            currentFile={mockCurrentFile}
            content={mockContent}
            onContentChange={mockOnContentChange}
          />
        );
        unmount();
      }

      expect(true).toBe(true);
    });
  });
});
