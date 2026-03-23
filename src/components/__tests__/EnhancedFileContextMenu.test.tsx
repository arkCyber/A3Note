import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedFileContextMenu from '../EnhancedFileContextMenu';
import { FileItem } from '../../types';

describe('EnhancedFileContextMenu', () => {
  const mockFile: FileItem = {
    path: '/test/file.md',
    name: 'file.md',
    isDirectory: false,
  };

  const mockProps = {
    x: 100,
    y: 200,
    file: mockFile,
    onOpen: vi.fn(),
    onOpenInNewTab: vi.fn(),
    onOpenInNewWindow: vi.fn(),
    onOpenToRight: vi.fn(),
    onRename: vi.fn(),
    onCopyPath: vi.fn(),
    onCopyObsidianURL: vi.fn(),
    onShowInExplorer: vi.fn(),
    onMoveTo: vi.fn(),
    onDuplicate: vi.fn(),
    onStar: vi.fn(),
    onProperties: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
    isStarred: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all menu items', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    expect(screen.getByText('Open')).toBeTruthy();
    expect(screen.getByText('Open in new tab')).toBeTruthy();
    expect(screen.getByText('Open in new window')).toBeTruthy();
    expect(screen.getByText('Open to the right')).toBeTruthy();
    expect(screen.getByText('Rename')).toBeTruthy();
    expect(screen.getByText('Copy path')).toBeTruthy();
    expect(screen.getByText('Copy Obsidian URL')).toBeTruthy();
    expect(screen.getByText('Show in system explorer')).toBeTruthy();
    expect(screen.getByText('Move to...')).toBeTruthy();
    expect(screen.getByText('Duplicate')).toBeTruthy();
    expect(screen.getByText('Add to starred')).toBeTruthy();
    expect(screen.getByText('Properties')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('should show "Remove from starred" when file is starred', () => {
    render(<EnhancedFileContextMenu {...mockProps} isStarred={true} />);
    
    expect(screen.getByText('Remove from starred')).toBeTruthy();
  });

  it('should call onOpen when Open is clicked', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    const openButton = screen.getByText('Open').closest('button');
    if (openButton) fireEvent.click(openButton);
    
    expect(mockProps.onOpen).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onOpenInNewTab when Open in new tab is clicked', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    const newTabButton = screen.getByText('Open in new tab').closest('button');
    if (newTabButton) fireEvent.click(newTabButton);
    
    expect(mockProps.onOpenInNewTab).toHaveBeenCalled();
  });

  it('should call onDuplicate when Duplicate is clicked', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    const duplicateButton = screen.getByText('Duplicate').closest('button');
    if (duplicateButton) fireEvent.click(duplicateButton);
    
    expect(mockProps.onDuplicate).toHaveBeenCalled();
  });

  it('should call onStar when Add to starred is clicked', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    const starButton = screen.getByText('Add to starred').closest('button');
    if (starButton) fireEvent.click(starButton);
    
    expect(mockProps.onStar).toHaveBeenCalled();
  });

  it('should call onDelete when Delete is clicked', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete').closest('button');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should close menu when pressing Escape', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should display keyboard shortcuts', () => {
    render(<EnhancedFileContextMenu {...mockProps} />);
    
    expect(screen.getByText('Ctrl+Click')).toBeTruthy();
  });
});
