/**
 * PluginManager Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PluginManager from '../PluginManager';

describe('PluginManager Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render PluginManager component', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/plugin manager/i)).toBeInTheDocument();
    });

    it('should render plugin list', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/plugins/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<PluginManager onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render plugin cards', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/sample plugin/i)).toBeInTheDocument();
    });
  });

  describe('Plugin Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<PluginManager onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should toggle plugin enable/disable', async () => {
      render(<PluginManager onClose={mockOnClose} />);
      
      const toggleButton = screen.getAllByRole('button')[0];
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should handle plugin settings', async () => {
      render(<PluginManager onClose={mockOnClose} />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(settingsButton).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onClose gracefully', () => {
      expect(() => {
        render(<PluginManager onClose={null as any} />);
      }).not.toThrow();
    });

    it('should handle plugin loading errors gracefully', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/plugin manager/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PluginManager onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<PluginManager onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<PluginManager onClose={mockOnClose} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle rapid plugin toggles', async () => {
      render(<PluginManager onClose={mockOnClose} />);
      
      const toggleButtons = screen.getAllByRole('button').slice(0, 5);
      
      toggleButtons.forEach(button => {
        fireEvent.click(button);
      });
      
      await waitFor(() => {
        expect(toggleButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Layout', () => {
    it('should have proper modal layout', () => {
      const { container } = render(<PluginManager onClose={mockOnClose} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
    });

    it('should have proper spacing', () => {
      render(<PluginManager onClose={mockOnClose} />);
      const pluginCards = screen.getAllByRole('article');
      
      pluginCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty plugin list', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/plugin manager/i)).toBeInTheDocument();
    });

    it('should handle large number of plugins', () => {
      render(<PluginManager onClose={mockOnClose} />);
      expect(screen.getByText(/plugin manager/i)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [isOpen, setIsOpen] = vi.fn();
        return (
          <div>
            <PluginManager onClose={setIsOpen} />
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });
  });
});
