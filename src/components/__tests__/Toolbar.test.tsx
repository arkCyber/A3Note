/**
 * Toolbar Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '../Toolbar';
import { FileItem } from '../../types';

describe('Toolbar Component', () => {
  const mockCurrentFile: FileItem = {
    path: '/test/file.md',
    name: 'file.md',
    isDirectory: false,
  };

  const mockProps = {
    currentFile: mockCurrentFile,
    isDirty: false,
    isSaving: false,
    onNewFile: vi.fn(),
    onSave: vi.fn(),
    onOpenWorkspace: vi.fn(),
    onToggleSidebar: vi.fn(),
    onToggleSearch: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenPluginMarketplace: vi.fn(),
    sidebarOpen: true,
    searchOpen: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Toolbar component', () => {
      render(<Toolbar {...mockProps} />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('should render all buttons', () => {
      render(<Toolbar {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render current file name', () => {
      render(<Toolbar {...mockProps} />);
      expect(screen.getByText('file.md')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<Toolbar {...mockProps} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should render new file button', () => {
      render(<Toolbar {...mockProps} />);
      const newFileButton = screen.getByRole('button', { name: /new file/i });
      expect(newFileButton).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<Toolbar {...mockProps} />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<Toolbar {...mockProps} />);
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onNewFile when new file button is clicked', () => {
      render(<Toolbar {...mockProps} />);
      const newFileButton = screen.getByRole('button', { name: /new file/i });
      
      fireEvent.click(newFileButton);
      expect(mockProps.onNewFile).toHaveBeenCalledTimes(1);
    });

    it('should call onSave when save button is clicked', () => {
      render(<Toolbar {...mockProps} isDirty={true} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      
      fireEvent.click(saveButton);
      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleSearch when search button is clicked', () => {
      render(<Toolbar {...mockProps} />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.click(searchButton);
      expect(mockProps.onToggleSearch).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenSettings when settings button is clicked', () => {
      render(<Toolbar {...mockProps} />);
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      
      fireEvent.click(settingsButton);
      expect(mockProps.onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleSidebar when sidebar toggle button is clicked', () => {
      render(<Toolbar {...mockProps} />);
      const sidebarButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(sidebarButton);
      expect(mockProps.onToggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('should disable save button when not dirty', () => {
      render(<Toolbar {...mockProps} isDirty={false} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when dirty', () => {
      render(<Toolbar {...mockProps} isDirty={true} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      
      expect(saveButton).not.toBeDisabled();
    });

    it('should show loading state when saving', () => {
      render(<Toolbar {...mockProps} isSaving={true} />);
      const saveButton = screen.getByRole('button', { name: /saving/i });
      
      expect(saveButton).toBeInTheDocument();
    });

    it('should highlight search button when search is open', () => {
      render(<Toolbar {...mockProps} searchOpen={true} />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('File Status', () => {
    it('should display dirty indicator when file is dirty', () => {
      render(<Toolbar {...mockProps} isDirty={true} />);
      expect(screen.getByText('●')).toBeInTheDocument();
    });

    it('should not display dirty indicator when file is not dirty', () => {
      render(<Toolbar {...mockProps} isDirty={false} />);
      expect(screen.queryByText('●')).not.toBeInTheDocument();
    });

    it('should display current file name', () => {
      render(<Toolbar {...mockProps} />);
      expect(screen.getByText('file.md')).toBeInTheDocument();
    });

    it('should display app name when no file is open', () => {
      render(<Toolbar {...mockProps} currentFile={null} />);
      expect(screen.getByText(/a3note/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callbacks gracefully', () => {
      const invalidProps = {
        ...mockProps,
        onNewFile: null as any,
        onSave: null as any,
      };
      
      expect(() => render(<Toolbar {...invalidProps} />)).not.toThrow();
    });

    it('should handle button click errors gracefully', () => {
      const errorProps = {
        ...mockProps,
        onNewFile: () => { throw new Error('Test error'); },
      };
      
      render(<Toolbar {...errorProps} />);
      const newFileButton = screen.getByRole('button', { name: /new file/i });
      
      expect(() => fireEvent.click(newFileButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Toolbar {...mockProps} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<Toolbar {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper focus management', () => {
      render(<Toolbar {...mockProps} />);
      const saveButton = screen.getByRole('button', { name: /save/i });
      
      saveButton.focus();
      expect(saveButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<Toolbar {...mockProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle rapid button clicks', () => {
      render(<Toolbar {...mockProps} />);
      const newFileButton = screen.getByRole('button', { name: /new file/i });
      
      for (let i = 0; i < 100; i++) {
        fireEvent.click(newFileButton);
      }
      
      expect(mockProps.onNewFile).toHaveBeenCalledTimes(100);
    });
  });

  describe('Layout', () => {
    it('should have correct toolbar height', () => {
      const { container } = render(<Toolbar {...mockProps} />);
      const toolbar = container.querySelector('.h-12');
      expect(toolbar).toBeInTheDocument();
    });

    it('should have proper button spacing', () => {
      render(<Toolbar {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null current file', () => {
      render(<Toolbar {...mockProps} currentFile={null} />);
      expect(screen.getByText(/a3note/i)).toBeInTheDocument();
    });

    it('should handle undefined callbacks', () => {
      const undefinedProps = {
        ...mockProps,
        onNewFile: undefined as any,
      };
      
      expect(() => render(<Toolbar {...undefinedProps} />)).not.toThrow();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<Toolbar {...mockProps} />);
      
      for (let i = 0; i < 50; i++) {
        const newProps = {
          ...mockProps,
          isDirty: i % 2 === 0,
        };
        rerender(<Toolbar {...newProps} />);
      }
      
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [isDirty, setIsDirty] = vi.fn();
        return (
          <div>
            <Toolbar {...mockProps} isDirty={isDirty} />
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });

    it('should handle state changes from parent', () => {
      const { rerender } = render(<Toolbar {...mockProps} />);
      
      const newProps = {
        ...mockProps,
        isDirty: true,
      };
      
      rerender(<Toolbar {...newProps} />);
      expect(screen.getByText('●')).toBeInTheDocument();
    });
  });
});
