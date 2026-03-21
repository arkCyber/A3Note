import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import * as useThemeModule from '../../hooks/useTheme';

// Mock the useTheme hook
vi.mock('../../hooks/useTheme');

describe('ThemeToggle', () => {
  it('should render sun icon in dark mode', () => {
    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('title')).toContain('light');
  });

  it('should render moon icon in light mode', () => {
    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toContain('dark');
  });

  it('should call toggleTheme when clicked', () => {
    const mockToggleTheme = vi.fn();
    
    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should have proper aria-label', () => {
    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('light mode');
  });

  it('should update aria-label based on theme', () => {
    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('dark mode');
  });
});
