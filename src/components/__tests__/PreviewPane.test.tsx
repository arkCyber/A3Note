import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewPane from '../PreviewPane';

describe('PreviewPane', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toggle button when not visible', () => {
    render(
      <PreviewPane content="# Test" isVisible={false} onToggle={mockOnToggle} />
    );
    
    const toggleButton = screen.getByTitle(/Show preview/);
    expect(toggleButton).toBeInTheDocument();
  });

  it('should call onToggle when toggle button is clicked (hidden state)', () => {
    render(
      <PreviewPane content="# Test" isVisible={false} onToggle={mockOnToggle} />
    );
    
    const toggleButton = screen.getByTitle(/Show preview/);
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should render preview pane when visible', () => {
    render(
      <PreviewPane content="# Test" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should render markdown content when visible', () => {
    render(
      <PreviewPane content="# Test Heading" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('should show empty state when no content', () => {
    render(
      <PreviewPane content="" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText(/Start writing to see preview/)).toBeInTheDocument();
  });

  it('should call onToggle when hide button is clicked', () => {
    render(
      <PreviewPane content="# Test" isVisible={true} onToggle={mockOnToggle} />
    );
    
    const hideButton = screen.getByTitle(/Hide preview/);
    fireEvent.click(hideButton);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should have scroll sync button', () => {
    render(
      <PreviewPane content="# Test" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText('Sync Scroll')).toBeInTheDocument();
  });

  it('should toggle scroll sync when clicked', () => {
    render(
      <PreviewPane content="# Test" isVisible={true} onToggle={mockOnToggle} />
    );
    
    const syncButton = screen.getByText('Sync Scroll');
    
    // Should be active by default
    expect(syncButton.className).toContain('bg-primary');
    
    // Click to toggle
    fireEvent.click(syncButton);
    
    // Should be inactive after click
    expect(syncButton.className).toContain('bg-background');
  });

  it('should update preview when content changes', () => {
    const { rerender } = render(
      <PreviewPane content="# Initial" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText('Initial')).toBeInTheDocument();
    
    rerender(
      <PreviewPane content="# Updated" isVisible={true} onToggle={mockOnToggle} />
    );
    
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.queryByText('Initial')).not.toBeInTheDocument();
  });
});
