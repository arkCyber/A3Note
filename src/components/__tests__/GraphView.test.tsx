// GraphView Component Tests - Aerospace Grade

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GraphView from '../GraphView';

// Mock Tauri API
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import('@tauri-apps/api/tauri');

describe('GraphView Component', () => {
  const mockOnNavigate = vi.fn();
  const mockOnClose = vi.fn();
  const mockWorkspacePath = '/test/workspace';
  const mockCurrentFilePath = '/test/workspace/note1.md';

  const mockFiles = [
    { path: '/test/workspace/note1.md', name: 'note1.md', isDirectory: false },
    { path: '/test/workspace/note2.md', name: 'note2.md', isDirectory: false },
    { path: '/test/workspace/note3.md', name: 'note3.md', isDirectory: false },
  ];

  const mockFileContents = {
    '/test/workspace/note1.md': '# Note 1\n\nThis links to [[note2]]\n\n#tag1 #tag2',
    '/test/workspace/note2.md': '# Note 2\n\nThis links to [[note3]]\n\n#tag2',
    '/test/workspace/note3.md': '# Note 3\n\nNo links here\n\n#tag3',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (invoke as any).mockImplementation((cmd: string, args: any) => {
      if (cmd === 'list_directory') {
        return Promise.resolve(mockFiles);
      }
      if (cmd === 'read_file_content') {
        return Promise.resolve(mockFileContents[args.path as keyof typeof mockFileContents] || '');
      }
      return Promise.resolve(null);
    });
  });

  describe('Rendering', () => {
    it('should render graph view modal', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Loading graph...')).toBeInTheDocument();
    });

    it('should display node and link counts', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/3 notes, 2 links/)).toBeInTheDocument();
      });
    });

    it('should render canvas element', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe('Controls', () => {
    it('should have zoom in button', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
      });
    });

    it('should have zoom out button', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
      });
    });

    it('should have reset view button', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTitle('Reset View')).toBeInTheDocument();
      });
    });

    it('should call onClose when close button clicked', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Filters', () => {
    it('should have orphan notes filter checkbox', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Show orphan notes')).toBeInTheDocument();
      });
    });

    it('should have tag filter dropdown', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      });
    });

    it('should toggle orphan notes filter', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        
        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load graph data on mount', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('list_directory', { path: mockWorkspacePath });
      });
    });

    it('should read file contents for all markdown files', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('read_file_content', { path: '/test/workspace/note1.md' });
        expect(invoke).toHaveBeenCalledWith('read_file_content', { path: '/test/workspace/note2.md' });
        expect(invoke).toHaveBeenCalledWith('read_file_content', { path: '/test/workspace/note3.md' });
      });
    });

    it('should handle loading errors gracefully', async () => {
      (invoke as any).mockRejectedValue(new Error('Failed to load'));

      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading graph...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
        expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
        expect(screen.getByTitle('Reset View')).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      render(
        <GraphView
          workspacePath={mockWorkspacePath}
          currentFilePath={mockCurrentFilePath}
          onNavigate={mockOnNavigate}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);
      });
    });
  });
});
