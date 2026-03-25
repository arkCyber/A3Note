/**
 * Quick Switcher Component Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickSwitcher from '../../components/QuickSwitcher';
import { QuickSwitcherResult } from '../../services/QuickSwitcherService';
import { FileItem } from '../../types';

describe('QuickSwitcher', () => {
  const mockFile1: FileItem = {
    id: '1',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
  };

  const mockFile2: FileItem = {
    id: '2',
    name: 'index.ts',
    path: 'src/index.ts',
    type: 'file',
  };

  const mockResults: QuickSwitcherResult[] = [
    {
      file: mockFile1,
      score: 100,
      matchedIndices: [0, 1, 2],
    },
    {
      file: mockFile2,
      score: 50,
      matchedIndices: [0],
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectFile: vi.fn(),
    results: mockResults,
    onSearch: vi.fn(),
    recentFiles: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<QuickSwitcher {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<QuickSwitcher {...defaultProps} isOpen={false} />);
      expect(screen.queryByPlaceholderText('Search files...')).not.toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('should render results', () => {
      render(<QuickSwitcher {...defaultProps} />);
      expect(screen.getByText('README.md')).toBeInTheDocument();
      expect(screen.getByText('index.ts')).toBeInTheDocument();
    });

    it('should render result count', () => {
      render(<QuickSwitcher {...defaultProps} />);
      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should render singular result count', () => {
      render(<QuickSwitcher {...defaultProps} results={[mockResults[0]]} />);
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('should render no results message', () => {
      render(<QuickSwitcher {...defaultProps} results={[]} />);
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });
      expect(screen.getByText('No files found')).toBeInTheDocument();
    });

    it('should render recent files label when no query', () => {
      render(<QuickSwitcher {...defaultProps} results={[]} recentFiles={['file.md']} />);
      expect(screen.getByText('Recent Files')).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('should update query on input', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input.value).toBe('test');
    });

    it('should call onSearch when query changes', () => {
      const onSearch = vi.fn();
      render(<QuickSwitcher {...defaultProps} onSearch={onSearch} />);
      
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });

      expect(onSearch).toHaveBeenCalledWith('test');
    });

    it('should clear query on clear button click', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input.value).toBe('test');

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(input.value).toBe('');
    });

    it('should show clear button only when query exists', () => {
      render(<QuickSwitcher {...defaultProps} />);
      
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
      
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should select next item on ArrowDown', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // Second item should be selected (has bg-primary/10)
      const items = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('README.md') || btn.textContent?.includes('index.ts')
      );
      expect(items[1]).toHaveClass('bg-primary/10');
    });

    it('should select previous item on ArrowUp', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      const items = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('README.md') || btn.textContent?.includes('index.ts')
      );
      expect(items[0]).toHaveClass('bg-primary/10');
    });

    it('should not go below first item', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...');
      
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      const items = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('README.md') || btn.textContent?.includes('index.ts')
      );
      expect(items[0]).toHaveClass('bg-primary/10');
    });

    it('should not go above last item', () => {
      render(<QuickSwitcher {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search files...');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const items = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('README.md') || btn.textContent?.includes('index.ts')
      );
      expect(items[1]).toHaveClass('bg-primary/10');
    });

    it('should select file on Enter', () => {
      const onSelectFile = vi.fn();
      render(<QuickSwitcher {...defaultProps} onSelectFile={onSelectFile} />);
      
      fireEvent.keyDown(screen.getByPlaceholderText('Search files...'), { key: 'Enter' });
      
      expect(onSelectFile).toHaveBeenCalledWith(mockFile1);
    });

    it('should close on Escape', () => {
      const onClose = vi.fn();
      render(<QuickSwitcher {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(screen.getByPlaceholderText('Search files...'), { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('File Selection', () => {
    it('should select file on click', () => {
      const onSelectFile = vi.fn();
      render(<QuickSwitcher {...defaultProps} onSelectFile={onSelectFile} />);
      
      const fileButton = screen.getByText('README.md').closest('button');
      fireEvent.click(fileButton!);
      
      expect(onSelectFile).toHaveBeenCalledWith(mockFile1);
    });

    it('should close after selection', () => {
      const onClose = vi.fn();
      render(<QuickSwitcher {...defaultProps} onClose={onClose} />);
      
      const fileButton = screen.getByText('README.md').closest('button');
      fireEvent.click(fileButton!);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Highlighting', () => {
    it('should highlight matched characters', () => {
      render(<QuickSwitcher {...defaultProps} />);
      
      const highlighted = screen.getByText('README.md').querySelectorAll('.text-primary');
      expect(highlighted.length).toBeGreaterThan(0);
    });

    it('should show score for results with query', () => {
      render(<QuickSwitcher {...defaultProps} />);
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });
      
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Recent Files', () => {
    it('should show clock icon for recent files', () => {
      render(<QuickSwitcher {...defaultProps} recentFiles={['README.md']} />);
      
      // Clock icon should be present
      const buttons = screen.getAllByRole('button');
      const readmeButton = buttons.find(btn => btn.textContent?.includes('README.md'));
      expect(readmeButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<QuickSwitcher {...defaultProps} />);
      
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should focus input on open', async () => {
      const { rerender } = render(<QuickSwitcher {...defaultProps} isOpen={false} />);
      
      rerender(<QuickSwitcher {...defaultProps} isOpen={true} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search files...')).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results', () => {
      render(<QuickSwitcher {...defaultProps} results={[]} />);
      
      fireEvent.change(screen.getByPlaceholderText('Search files...'), {
        target: { value: 'test' },
      });
      
      expect(screen.getByText('No files found')).toBeInTheDocument();
    });

    it('should handle results without matched indices', () => {
      const resultsWithoutIndices: QuickSwitcherResult[] = [
        {
          file: mockFile1,
          score: 100,
          matchedIndices: [],
        },
      ];
      
      render(<QuickSwitcher {...defaultProps} results={resultsWithoutIndices} />);
      expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    it('should reset selection when results change', () => {
      const { rerender } = render(<QuickSwitcher {...defaultProps} />);
      
      fireEvent.keyDown(screen.getByPlaceholderText('Search files...'), { key: 'ArrowDown' });
      
      rerender(<QuickSwitcher {...defaultProps} results={[mockResults[0]]} />);
      
      const items = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('README.md')
      );
      expect(items[0]).toHaveClass('bg-primary/10');
    });
  });
});
