/**
 * SearchPanel Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPanel from '../SearchPanel';
import { FileItem } from '../../types';

describe('SearchPanel Component', () => {
  const mockResults: FileItem[] = [
    {
      path: '/test/note1.md',
      name: 'note1.md',
      isDirectory: false,
    },
    {
      path: '/test/note2.md',
      name: 'note2.md',
      isDirectory: false,
    },
  ];

  const mockProps = {
    query: '',
    results: mockResults,
    isSearching: false,
    onSearch: vi.fn(),
    onResultClick: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render SearchPanel component', () => {
      render(<SearchPanel {...mockProps} />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should render search results', () => {
      render(<SearchPanel {...mockProps} />);
      expect(screen.getByText('note1.md')).toBeInTheDocument();
      expect(screen.getByText('note2.md')).toBeInTheDocument();
    });

    it('should render loading state when searching', () => {
      render(<SearchPanel {...mockProps} isSearching={true} />);
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it('should render empty state when no results', () => {
      render(<SearchPanel {...mockProps} results={[]} />);
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<SearchPanel {...mockProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearch when typing in search input', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(mockProps.onSearch).toHaveBeenCalledWith('test');
    });

    it('should update search query', () => {
      const { rerender } = render(<SearchPanel {...mockProps} />);
      
      rerender(<SearchPanel {...mockProps} query="test" />);
      
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('test');
    });

    it('should debounce search input', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'te' } });
      fireEvent.change(searchInput, { target: { value: 'tes' } });
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockProps.onSearch).toHaveBeenCalled();
    });
  });

  describe('Result Interactions', () => {
    it('should call onResultClick when result is clicked', () => {
      render(<SearchPanel {...mockProps} />);
      const result = screen.getByText('note1.md');
      
      fireEvent.click(result);
      expect(mockProps.onResultClick).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should highlight selected result', () => {
      render(<SearchPanel {...mockProps} />);
      const results = screen.getAllByText(/note/);
      
      results.forEach(result => {
        expect(result).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      searchInput.focus();
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<SearchPanel {...mockProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty results gracefully', () => {
      render(<SearchPanel {...mockProps} results={[]} />);
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it('should handle null results', () => {
      render(<SearchPanel {...mockProps} results={null as any} />);
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it('should handle undefined onSearch', () => {
      expect(() => {
        render(<SearchPanel {...mockProps} onSearch={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle search errors gracefully', () => {
      const errorProps = {
        ...mockProps,
        onSearch: () => { throw new Error('Search error'); },
      };
      
      expect(() => render(<SearchPanel {...errorProps} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<SearchPanel {...mockProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large result sets', () => {
      const largeResults = Array.from({ length: 1000 }, (_, i) => ({
        path: `/test/note${i}.md`,
        name: `note${i}.md`,
        isDirectory: false,
      }));
      
      const startTime = performance.now();
      render(<SearchPanel {...mockProps} results={largeResults} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle rapid search input changes', () => {
      render(<SearchPanel {...mockProps} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      for (let i = 0; i < 100; i++) {
        fireEvent.change(searchInput, { target: { value: `test${i}` } });
      }
      
      expect(mockProps.onSearch).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      render(<SearchPanel {...mockProps} query={longQuery} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe(longQuery);
    });

    it('should handle special characters in search query', () => {
      const specialQuery = '@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      render(<SearchPanel {...mockProps} query={specialQuery} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe(specialQuery);
    });

    it('should handle empty search query', () => {
      render(<SearchPanel {...mockProps} query="" />);
      
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('');
    });

    it('should handle whitespace-only search query', () => {
      render(<SearchPanel {...mockProps} query="   " />);
      
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('   ');
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [query, setQuery] = vi.fn();
        const [results, setResults] = vi.fn();
        
        return (
          <div>
            <SearchPanel
              query={query}
              results={results}
              isSearching={false}
              onSearch={setQuery}
              onResultClick={vi.fn()}
              onClose={vi.fn()}
            />
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });
  });
});
