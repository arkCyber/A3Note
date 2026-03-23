import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TagContextMenu from '../TagContextMenu';

describe('TagContextMenu', () => {
  const mockProps = {
    x: 100,
    y: 200,
    tag: '#important',
    onSearch: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all menu items', () => {
    render(<TagContextMenu {...mockProps} />);
    
    expect(screen.getByText('Search tag')).toBeTruthy();
    expect(screen.getByText('Rename tag')).toBeTruthy();
    expect(screen.getByText('Delete tag')).toBeTruthy();
  });

  it('should call onSearch when Search tag is clicked', () => {
    render(<TagContextMenu {...mockProps} />);
    
    const searchButton = screen.getByText('Search tag').closest('button');
    if (searchButton) fireEvent.click(searchButton);
    
    expect(mockProps.onSearch).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onRename when Rename tag is clicked', () => {
    render(<TagContextMenu {...mockProps} />);
    
    const renameButton = screen.getByText('Rename tag').closest('button');
    if (renameButton) fireEvent.click(renameButton);
    
    expect(mockProps.onRename).toHaveBeenCalled();
  });

  it('should call onDelete when Delete tag is clicked', () => {
    render(<TagContextMenu {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete tag').closest('button');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', () => {
    render(<TagContextMenu {...mockProps} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should close menu when pressing Escape', () => {
    render(<TagContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should disable items when handlers are not provided', () => {
    render(<TagContextMenu {...mockProps} onSearch={undefined} />);
    
    const searchButton = screen.getByText('Search tag').closest('button');
    expect(searchButton?.hasAttribute('disabled')).toBe(true);
  });
});
