import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorContextMenu from '../EditorContextMenu';

describe('EditorContextMenu', () => {
  const mockProps = {
    x: 100,
    y: 200,
    selectedText: 'Selected text',
    hasSelection: true,
    onCut: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onSelectAll: vi.fn(),
    onFind: vi.fn(),
    onReplace: vi.fn(),
    onInsertLink: vi.fn(),
    onInsertImage: vi.fn(),
    onInsertCodeBlock: vi.fn(),
    onBold: vi.fn(),
    onItalic: vi.fn(),
    onHighlight: vi.fn(),
    onStrikethrough: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all menu items', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    expect(screen.getByText('Cut')).toBeTruthy();
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByText('Paste')).toBeTruthy();
    expect(screen.getByText('Find')).toBeTruthy();
    expect(screen.getByText('Replace')).toBeTruthy();
    expect(screen.getByText('Select all')).toBeTruthy();
    expect(screen.getByText('Insert link')).toBeTruthy();
    expect(screen.getByText('Insert image')).toBeTruthy();
    expect(screen.getByText('Insert code block')).toBeTruthy();
  });

  it('should show formatting options when text is selected', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    expect(screen.getByText('Bold')).toBeTruthy();
    expect(screen.getByText('Italic')).toBeTruthy();
    expect(screen.getByText('Highlight')).toBeTruthy();
    expect(screen.getByText('Strikethrough')).toBeTruthy();
  });

  it('should not show formatting options when no text is selected', () => {
    render(<EditorContextMenu {...mockProps} hasSelection={false} />);
    
    expect(screen.queryByText('Bold')).toBeNull();
    expect(screen.queryByText('Italic')).toBeNull();
  });

  it('should call onCut when Cut is clicked', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    const cutButton = screen.getByText('Cut').closest('button');
    if (cutButton) fireEvent.click(cutButton);
    
    expect(mockProps.onCut).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onCopy when Copy is clicked', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    const copyButton = screen.getByText('Copy').closest('button');
    if (copyButton) fireEvent.click(copyButton);
    
    expect(mockProps.onCopy).toHaveBeenCalled();
  });

  it('should call onBold when Bold is clicked', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    const boldButton = screen.getByText('Bold').closest('button');
    if (boldButton) fireEvent.click(boldButton);
    
    expect(mockProps.onBold).toHaveBeenCalled();
  });

  it('should disable Cut and Copy when no selection', () => {
    render(<EditorContextMenu {...mockProps} hasSelection={false} />);
    
    const cutButton = screen.getByText('Cut').closest('button');
    const copyButton = screen.getByText('Copy').closest('button');
    
    expect(cutButton?.hasAttribute('disabled')).toBe(true);
    expect(copyButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should close menu when clicking outside', () => {
    const { container } = render(<EditorContextMenu {...mockProps} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should close menu when pressing Escape', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should display keyboard shortcuts', () => {
    render(<EditorContextMenu {...mockProps} />);
    
    expect(screen.getByText('Ctrl+X')).toBeTruthy();
    expect(screen.getByText('Ctrl+C')).toBeTruthy();
    expect(screen.getByText('Ctrl+V')).toBeTruthy();
    expect(screen.getByText('Ctrl+B')).toBeTruthy();
  });
});
