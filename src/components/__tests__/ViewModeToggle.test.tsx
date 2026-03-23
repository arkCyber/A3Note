import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewModeToggle, { ViewMode } from '../ViewModeToggle';

describe('ViewModeToggle', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    localStorage.clear();
  });

  it('should render all three mode buttons', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Live')).toBeTruthy();
    expect(screen.getByText('Preview')).toBeTruthy();
  });

  it('should highlight the active mode', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    const editButton = screen.getByText('Edit').closest('button');
    expect(editButton?.className).toContain('bg-primary');
  });

  it('should call onChange when Edit button is clicked', () => {
    render(<ViewModeToggle mode="preview" onChange={mockOnChange} />);
    
    const editButton = screen.getByText('Edit').closest('button');
    if (editButton) {
      fireEvent.click(editButton);
    }
    
    expect(mockOnChange).toHaveBeenCalledWith('edit');
  });

  it('should call onChange when Live Preview button is clicked', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    const liveButton = screen.getByText('Live').closest('button');
    if (liveButton) {
      fireEvent.click(liveButton);
    }
    
    expect(mockOnChange).toHaveBeenCalledWith('live-preview');
  });

  it('should call onChange when Preview button is clicked', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    const previewButton = screen.getByText('Preview').closest('button');
    if (previewButton) {
      fireEvent.click(previewButton);
    }
    
    expect(mockOnChange).toHaveBeenCalledWith('preview');
  });

  it('should save mode to localStorage when changed', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    const previewButton = screen.getByText('Preview').closest('button');
    if (previewButton) {
      fireEvent.click(previewButton);
    }
    
    expect(localStorage.getItem('a3note-view-mode')).toBe('preview');
  });

  it('should show correct tooltips', () => {
    render(<ViewModeToggle mode="edit" onChange={mockOnChange} />);
    
    const editButton = screen.getByText('Edit').closest('button');
    expect(editButton?.getAttribute('title')).toContain('Edit mode');
    
    const liveButton = screen.getByText('Live').closest('button');
    expect(liveButton?.getAttribute('title')).toContain('Live preview mode');
    
    const previewButton = screen.getByText('Preview').closest('button');
    expect(previewButton?.getAttribute('title')).toContain('Preview mode');
  });

  it('should set aria-pressed attribute correctly', () => {
    render(<ViewModeToggle mode="live-preview" onChange={mockOnChange} />);
    
    const liveButton = screen.getByText('Live').closest('button');
    expect(liveButton?.getAttribute('aria-pressed')).toBe('true');
    
    const editButton = screen.getByText('Edit').closest('button');
    expect(editButton?.getAttribute('aria-pressed')).toBe('false');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ViewModeToggle mode="edit" onChange={mockOnChange} className="custom-class" />
    );
    
    expect(container.firstChild?.className).toContain('custom-class');
  });
});
