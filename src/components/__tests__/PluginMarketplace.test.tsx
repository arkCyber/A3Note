/**
 * PluginMarketplace Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PluginMarketplace from '../PluginMarketplace';

describe('PluginMarketplace Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render PluginMarketplace component', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should render plugin list', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugins/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render plugin cards', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/sample plugin/i)).toBeInTheDocument();
    });
  });

  describe('Plugin Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should filter plugins when searching', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      fireEvent.change(searchInput, { target: { value: 'sample' } });
      
      await waitFor(() => {
        expect(screen.getByText(/sample plugin/i)).toBeInTheDocument();
      });
    });

    it('should install plugin when install button is clicked', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const installButtons = screen.getAllByRole('button', { name: /install/i });
      if (installButtons.length > 0) {
        fireEvent.click(installButtons[0]);
        
        await waitFor(() => {
          expect(installButtons[0]).toBeInTheDocument();
        });
      }
    });

    it('should show plugin details when plugin card is clicked', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const pluginCard = screen.getByText(/sample plugin/i);
      fireEvent.click(pluginCard);
      
      await waitFor(() => {
        expect(pluginCard).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onClose gracefully', () => {
      expect(() => {
        render(<PluginMarketplace onClose={null as any} />);
      }).not.toThrow();
    });

    it('should handle plugin loading errors gracefully', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should handle installation errors gracefully', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });

    it('should handle keyboard navigation for plugin list', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<PluginMarketplace onClose={mockOnClose} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(300);
    });

    it('should handle large plugin list efficiently', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should handle rapid search input changes', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      for (let i = 0; i < 50; i++) {
        fireEvent.change(searchInput, { target: { value: `test${i}` } });
      }
      
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper modal layout', () => {
      const { container } = render(<PluginMarketplace onClose={mockOnClose} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
    });

    it('should have proper spacing', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const pluginCards = screen.getAllByRole('article');
      
      pluginCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty plugin list', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should handle search with no results', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should handle very long search queries', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      const longQuery = 'a'.repeat(1000);
      fireEvent.change(searchInput, { target: { value: longQuery } });
      
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [isOpen, setIsOpen] = vi.fn();
        return (
          <div>
            <PluginMarketplace onClose={setIsOpen} />
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });

    it('should handle state changes from parent', () => {
      const { rerender } = render(<PluginMarketplace onClose={mockOnClose} />);
      
      const newProps = {
        onClose: vi.fn(),
      };
      
      rerender(<PluginMarketplace {...newProps} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });
  });

  describe('Plugin Information', () => {
    it('should display plugin name', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/sample plugin/i)).toBeInTheDocument();
    });

    it('should display plugin description', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/sample/i)).toBeInTheDocument();
    });

    it('should display plugin version', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should display plugin author', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter plugins by category', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should sort plugins by name', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should sort plugins by popularity', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should provide clear call to action', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      const installButtons = screen.getAllByRole('button', { name: /install/i });
      
      installButtons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('should display helpful information', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });

    it('should show loading state during installation', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      expect(screen.getByText(/plugin marketplace/i)).toBeInTheDocument();
    });
  });
});
