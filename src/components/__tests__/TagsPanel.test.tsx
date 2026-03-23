// TagsPanel Component Tests - Aerospace Grade

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TagsPanel from '../TagsPanel';

// Mock Tauri API
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import('@tauri-apps/api/tauri');

describe('TagsPanel Component', () => {
  const mockOnNavigate = vi.fn();
  const mockOnTagFilter = vi.fn();
  const mockWorkspacePath = '/test/workspace';

  const mockFiles = [
    { path: '/test/workspace/note1.md', name: 'note1.md', isDirectory: false },
    { path: '/test/workspace/note2.md', name: 'note2.md', isDirectory: false },
    { path: '/test/workspace/note3.md', name: 'note3.md', isDirectory: false },
  ];

  const mockFileContents = {
    '/test/workspace/note1.md': '# Note 1\n\n#project/frontend #javascript',
    '/test/workspace/note2.md': '# Note 2\n\n#project/backend #python',
    '/test/workspace/note3.md': '# Note 3\n\n#personal #todo',
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
    it('should render tags panel', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tags')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      expect(screen.getByText('Loading tags...')).toBeInTheDocument();
    });

    it('should display tag count in footer', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/tags/)).toBeInTheDocument();
      });
    });

    it('should show empty state when no tags', async () => {
      (invoke as any).mockImplementation((cmd: string) => {
        if (cmd === 'list_directory') {
          return Promise.resolve([]);
        }
        return Promise.resolve('');
      });

      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No tags found')).toBeInTheDocument();
        expect(screen.getByText('Add #tags to your notes')).toBeInTheDocument();
      });
    });
  });

  describe('Tag Tree', () => {
    it('should display hierarchical tags', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('project')).toBeInTheDocument();
        expect(screen.getByText('personal')).toBeInTheDocument();
      });
    });

    it('should show tag counts', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        const tagElements = screen.getAllByText(/\d+/);
        expect(tagElements.length).toBeGreaterThan(0);
      });
    });

    it('should expand/collapse tag nodes', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const projectTag = screen.getByText('project');
        fireEvent.click(projectTag);
        
        // Should show subtags
        await waitFor(() => {
          expect(screen.getByText('frontend')).toBeInTheDocument();
          expect(screen.getByText('backend')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Tag Filtering', () => {
    it('should call onTagFilter when tag clicked', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const personalTag = screen.getByText('personal');
        fireEvent.click(personalTag);
      });

      expect(mockOnTagFilter).toHaveBeenCalledWith('personal');
    });

    it('should highlight selected tag', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const personalTag = screen.getByText('personal');
        fireEvent.click(personalTag);
        
        const parent = personalTag.closest('div');
        expect(parent).toHaveClass('bg-primary/20');
      });
    });

    it('should show clear button when tag selected', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const personalTag = screen.getByText('personal');
        fireEvent.click(personalTag);
        
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('should clear filter when clear button clicked', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const personalTag = screen.getByText('personal');
        fireEvent.click(personalTag);
        
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
      });

      expect(mockOnTagFilter).toHaveBeenCalledWith(null);
    });
  });

  describe('Data Loading', () => {
    it('should load tags on mount', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('list_directory', { path: mockWorkspacePath });
      });
    });

    it('should read all markdown files', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
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
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument();
      });
    });

    it('should reload tags when workspace path changes', async () => {
      const { rerender } = render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(invoke).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      rerender(
        <TagsPanel
          workspacePath="/new/workspace"
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('list_directory', { path: '/new/workspace' });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: 'Tags' })).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      render(
        <TagsPanel
          workspacePath={mockWorkspacePath}
          onNavigate={mockOnNavigate}
          onTagFilter={mockOnTagFilter}
        />
      );

      await waitFor(async () => {
        const personalTag = screen.getByText('personal');
        personalTag.focus();
        expect(document.activeElement).toBe(personalTag.closest('div'));
      });
    });
  });
});
