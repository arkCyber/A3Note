import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookmarkContextMenu from '../BookmarkContextMenu';

describe('BookmarkContextMenu', () => {
  const mockGroups = [
    { id: 'group1', name: 'Work' },
    { id: 'group2', name: 'Personal' },
  ];

  const mockProps = {
    x: 100,
    y: 200,
    bookmarkId: 'bookmark1',
    bookmarkName: 'My Bookmark',
    groups: mockGroups,
    onOpen: vi.fn(),
    onOpenInNewTab: vi.fn(),
    onRename: vi.fn(),
    onMoveToGroup: vi.fn(),
    onRemove: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all menu items', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    expect(screen.getByText('Open')).toBeTruthy();
    expect(screen.getByText('Open in new tab')).toBeTruthy();
    expect(screen.getByText('Rename')).toBeTruthy();
    expect(screen.getByText('Remove')).toBeTruthy();
  });

  it('should show groups when provided', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    expect(screen.getByText('Move to group')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Personal')).toBeTruthy();
  });

  it('should not show groups section when no groups provided', () => {
    render(<BookmarkContextMenu {...mockProps} groups={[]} />);
    
    expect(screen.queryByText('Move to group')).toBeNull();
  });

  it('should call onOpen when Open is clicked', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    const openButton = screen.getByText('Open').closest('button');
    if (openButton) fireEvent.click(openButton);
    
    expect(mockProps.onOpen).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onMoveToGroup when group is clicked', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    const groupButton = screen.getByText('Work').closest('button');
    if (groupButton) fireEvent.click(groupButton);
    
    expect(mockProps.onMoveToGroup).toHaveBeenCalledWith('group1');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onRemove when Remove is clicked', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    const removeButton = screen.getByText('Remove').closest('button');
    if (removeButton) fireEvent.click(removeButton);
    
    expect(mockProps.onRemove).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should close menu when pressing Escape', () => {
    render(<BookmarkContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
