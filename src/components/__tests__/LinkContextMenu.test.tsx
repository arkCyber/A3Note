import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkContextMenu from '../LinkContextMenu';

describe('LinkContextMenu', () => {
  const mockProps = {
    x: 100,
    y: 200,
    link: 'https://example.com',
    linkText: 'Example Link',
    onOpenLink: vi.fn(),
    onOpenInNewTab: vi.fn(),
    onCopyLink: vi.fn(),
    onEditLink: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all menu items', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    expect(screen.getByText('Open link')).toBeTruthy();
    expect(screen.getByText('Open in new tab')).toBeTruthy();
    expect(screen.getByText('Copy link')).toBeTruthy();
    expect(screen.getByText('Edit link')).toBeTruthy();
  });

  it('should call onOpenLink when Open link is clicked', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    const openButton = screen.getByText('Open link').closest('button');
    if (openButton) fireEvent.click(openButton);
    
    expect(mockProps.onOpenLink).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onOpenInNewTab when Open in new tab is clicked', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    const newTabButton = screen.getByText('Open in new tab').closest('button');
    if (newTabButton) fireEvent.click(newTabButton);
    
    expect(mockProps.onOpenInNewTab).toHaveBeenCalled();
  });

  it('should call onCopyLink when Copy link is clicked', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    const copyButton = screen.getByText('Copy link').closest('button');
    if (copyButton) fireEvent.click(copyButton);
    
    expect(mockProps.onCopyLink).toHaveBeenCalled();
  });

  it('should call onEditLink when Edit link is clicked', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    const editButton = screen.getByText('Edit link').closest('button');
    if (editButton) fireEvent.click(editButton);
    
    expect(mockProps.onEditLink).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should close menu when pressing Escape', () => {
    render(<LinkContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should disable items when handlers are not provided', () => {
    render(<LinkContextMenu {...mockProps} onOpenLink={undefined} />);
    
    const openButton = screen.getByText('Open link').closest('button');
    expect(openButton?.hasAttribute('disabled')).toBe(true);
  });
});
