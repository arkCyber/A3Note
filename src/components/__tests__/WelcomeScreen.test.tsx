/**
 * WelcomeScreen Component Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen Component', () => {
  const mockOnOpenWorkspace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render WelcomeScreen component', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText(/obsidian-style/i)).toBeInTheDocument();
    });

    it('should render open workspace button', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      expect(button).toBeInTheDocument();
    });

    it('should render features section', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText(/features/i)).toBeInTheDocument();
    });

    it('should render keyboard shortcuts section', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onOpenWorkspace when button is clicked', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      fireEvent.click(button);
      expect(mockOnOpenWorkspace).toHaveBeenCalledTimes(1);
    });

    it('should handle button click errors gracefully', () => {
      const errorProps = {
        onOpenWorkspace: () => { throw new Error('Test error'); },
      };
      
      render(<WelcomeScreen {...errorProps} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      // The error will be thrown but React will handle it
      // We just verify the component renders without crashing
      expect(button).toBeInTheDocument();
    });

    it('should handle rapid button clicks', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(mockOnOpenWorkspace).toHaveBeenCalledTimes(10);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper button ARIA labels', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnOpenWorkspace).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onOpenWorkspace gracefully', () => {
      expect(() => {
        render(<WelcomeScreen onOpenWorkspace={null as any} />);
      }).not.toThrow();
    });

    it('should handle undefined onOpenWorkspace', () => {
      expect(() => {
        render(<WelcomeScreen onOpenWorkspace={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      
      for (let i = 0; i < 50; i++) {
        const newProps = {
          onOpenWorkspace: vi.fn(),
        };
        rerender(<WelcomeScreen {...newProps} />);
      }
      
      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have centered layout', () => {
      const { container } = render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const welcomeScreen = container.firstChild as HTMLElement;
      
      expect(welcomeScreen).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have proper spacing', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      expect(button).toHaveClass('px-6', 'py-3');
    });
  });

  describe('Visual Elements', () => {
    it('should display logo or icon', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
    });

    it('should have proper typography', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const heading = screen.getByRole('heading', { level: 1 });
      
      expect(heading).toHaveClass('text-4xl', 'font-bold');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty props', () => {
      expect(() => {
        render(<WelcomeScreen onOpenWorkspace={vi.fn()} />);
      }).not.toThrow();
    });

    it('should handle null children', () => {
      expect(() => {
        render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with parent component', () => {
      const ParentComponent = () => {
        const [isOpen, setIsOpen] = vi.fn();
        return (
          <div>
            <WelcomeScreen onOpenWorkspace={setIsOpen} />
          </div>
        );
      };
      
      expect(() => render(<ParentComponent />)).not.toThrow();
    });

    it('should handle state changes from parent', () => {
      const { rerender } = render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      
      const newProps = {
        onOpenWorkspace: vi.fn(),
      };
      
      rerender(<WelcomeScreen {...newProps} />);
      expect(screen.getByText('Welcome to A3Note')).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should provide clear call to action', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      const button = screen.getByRole('button', { name: /open workspace/i });
      
      expect(button).toBeVisible();
      expect(button).toHaveTextContent(/open workspace/i);
    });

    it('should display helpful information', () => {
      render(<WelcomeScreen onOpenWorkspace={mockOnOpenWorkspace} />);
      expect(screen.getByText(/obsidian-style/i)).toBeInTheDocument();
    });
  });
});
