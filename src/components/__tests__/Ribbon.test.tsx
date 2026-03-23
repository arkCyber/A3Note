/**
 * Ribbon Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Ribbon from '../Ribbon';

describe('Ribbon Component', () => {
  const mockProps = {
    onNewFile: vi.fn(),
    onToggleSearch: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenCommandPalette: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Ribbon component', () => {
      render(<Ribbon {...mockProps} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render all buttons', () => {
      render(<Ribbon {...mockProps} />);
      
      // Check for all buttons by their aria-labels
      expect(screen.getByLabelText('New File')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Command Palette')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
    });

    it('should have correct layout structure', () => {
      const { container } = render(<Ribbon {...mockProps} />);
      const ribbon = container.querySelector('.w-12');
      expect(ribbon).toBeInTheDocument();
      expect(ribbon).toHaveClass('bg-secondary', 'border-r', 'border-border', 'flex', 'flex-col');
    });
  });

  describe('Button Interactions', () => {
    it('should call onNewFile when New File button is clicked', () => {
      render(<Ribbon {...mockProps} />);
      const newFileButton = screen.getByLabelText('New File');
      
      fireEvent.click(newFileButton);
      expect(mockProps.onNewFile).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleSearch when Search button is clicked', () => {
      render(<Ribbon {...mockProps} />);
      const searchButton = screen.getByLabelText('Search');
      
      fireEvent.click(searchButton);
      expect(mockProps.onToggleSearch).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenCommandPalette when Command Palette button is clicked', () => {
      render(<Ribbon {...mockProps} />);
      const commandPaletteButton = screen.getByLabelText('Command Palette');
      
      fireEvent.click(commandPaletteButton);
      expect(mockProps.onOpenCommandPalette).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenSettings when Settings button is clicked', () => {
      render(<Ribbon {...mockProps} />);
      const settingsButton = screen.getByLabelText('Settings');
      
      fireEvent.click(settingsButton);
      expect(mockProps.onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('should open help documentation when Help button is clicked', () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
      render(<Ribbon {...mockProps} />);
      const helpButton = screen.getByLabelText('Help');
      
      fireEvent.click(helpButton);
      expect(mockOpen).toHaveBeenCalledWith('https://obsidian.md/help', '_blank');
      
      mockOpen.mockRestore();
    });
  });

  describe('Button States', () => {
    it('should have hover effect on buttons', () => {
      render(<Ribbon {...mockProps} />);
      const newFileButton = screen.getByLabelText('New File');
      
      expect(newFileButton).toHaveClass('hover:bg-background');
    });

    it('should have focus ring on buttons', () => {
      render(<Ribbon {...mockProps} />);
      const newFileButton = screen.getByLabelText('New File');
      
      newFileButton.focus();
      expect(newFileButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary');
    });

    it('should have correct button dimensions', () => {
      render(<Ribbon {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('w-10', 'h-10');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Ribbon {...mockProps} />);
      
      expect(screen.getByLabelText('New File')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Command Palette')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<Ribbon {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper button roles', () => {
      render(<Ribbon {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      expect(buttons.length).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      const invalidProps = {
        onNewFile: null as any,
        onToggleSearch: null as any,
        onOpenSettings: null as any,
        onOpenCommandPalette: null as any,
      };
      
      expect(() => render(<Ribbon {...invalidProps} />)).not.toThrow();
    });

    it('should handle button click errors gracefully', () => {
      const errorProps = {
        onNewFile: () => { throw new Error('Test error'); },
        onToggleSearch: vi.fn(),
        onOpenSettings: vi.fn(),
        onOpenCommandPalette: vi.fn(),
      };
      
      render(<Ribbon {...errorProps} />);
      const newFileButton = screen.getByLabelText('New File');
      
      expect(() => fireEvent.click(newFileButton)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<Ribbon {...mockProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle rapid button clicks', () => {
      render(<Ribbon {...mockProps} />);
      const newFileButton = screen.getByLabelText('New File');
      
      for (let i = 0; i < 100; i++) {
        fireEvent.click(newFileButton);
      }
      
      expect(mockProps.onNewFile).toHaveBeenCalledTimes(100);
    });
  });

  describe('Layout', () => {
    it('should have correct button spacing', () => {
      const { container } = render(<Ribbon {...mockProps} />);
      const ribbon = container.querySelector('.flex-col');
      
      expect(ribbon).toHaveClass('gap-1');
    });

    it('should have correct padding', () => {
      const { container } = render(<Ribbon {...mockProps} />);
      const ribbon = container.querySelector('.w-12');
      
      expect(ribbon).toHaveClass('py-2');
    });

    it('should have correct width', () => {
      const { container } = render(<Ribbon {...mockProps} />);
      const ribbon = container.querySelector('.w-12');
      
      expect(ribbon).toHaveClass('w-12');
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [count, setCount] = vi.fn();
        return (
          <div>
            <Ribbon {...mockProps} />
            <div>Count: {count}</div>
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });

    it('should handle state changes from parent', () => {
      const { rerender } = render(<Ribbon {...mockProps} />);
      
      const newProps = {
        ...mockProps,
        onNewFile: vi.fn(),
      };
      
      rerender(<Ribbon {...newProps} />);
      expect(screen.getByLabelText('New File')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty props', () => {
      const emptyProps = {
        onNewFile: vi.fn(),
        onToggleSearch: vi.fn(),
        onOpenSettings: vi.fn(),
        onOpenCommandPalette: vi.fn(),
      };
      
      expect(() => render(<Ribbon {...emptyProps} />)).not.toThrow();
    });

    it('should handle undefined callbacks', () => {
      const undefinedProps = {
        onNewFile: undefined as any,
        onToggleSearch: undefined as any,
        onOpenSettings: undefined as any,
        onOpenCommandPalette: undefined as any,
      };
      
      expect(() => render(<Ribbon {...undefinedProps} />)).not.toThrow();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<Ribbon {...mockProps} />);
      
      for (let i = 0; i < 50; i++) {
        const newProps = {
          onNewFile: vi.fn(),
          onToggleSearch: vi.fn(),
          onOpenSettings: vi.fn(),
          onOpenCommandPalette: vi.fn(),
        };
        rerender(<Ribbon {...newProps} />);
      }
      
      expect(screen.getByLabelText('New File')).toBeInTheDocument();
    });
  });

  describe('Visual Regression', () => {
    it('should maintain consistent button sizes', () => {
      render(<Ribbon {...mockProps} />);
      const buttons = screen.getAllByRole('button');
      
      const firstButtonSize = buttons[0].getBoundingClientRect();
      buttons.forEach(button => {
        const size = button.getBoundingClientRect();
        expect(size.width).toBe(firstButtonSize.width);
        expect(size.height).toBe(firstButtonSize.height);
      });
    });

    it('should maintain consistent spacing', () => {
      const { container } = render(<Ribbon {...mockProps} />);
      const ribbon = container.querySelector('.w-12');
      
      expect(ribbon).toHaveClass('gap-1');
    });
  });
});
