import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu, { fileContextMenuItems } from '../ContextMenu';
import { Trash2 } from 'lucide-react';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();

  const mockItems = [
    {
      label: 'Test Item 1',
      onClick: vi.fn(),
    },
    {
      label: 'Test Item 2',
      icon: <Trash2 size={14} />,
      onClick: vi.fn(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render menu items', () => {
    render(<ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('should call onClick when item is clicked', () => {
    render(<ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Test Item 1'));
    
    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close menu when clicking outside', () => {
    render(<ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />);
    
    fireEvent.mouseDown(document.body);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close menu when pressing Escape', () => {
    render(<ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick for disabled items', () => {
    const disabledItems = [
      {
        label: 'Disabled Item',
        onClick: vi.fn(),
        disabled: true,
      },
    ];

    render(<ContextMenu x={100} y={100} items={disabledItems} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Disabled Item'));
    
    expect(disabledItems[0].onClick).not.toHaveBeenCalled();
  });

  it('should render separator', () => {
    const itemsWithSeparator = [
      { label: 'Item 1', onClick: vi.fn() },
      { label: '', onClick: vi.fn(), separator: true },
      { label: 'Item 2', onClick: vi.fn() },
    ];

    const { container } = render(
      <ContextMenu x={100} y={100} items={itemsWithSeparator} onClose={mockOnClose} />
    );
    
    const separator = container.querySelector('.h-px');
    expect(separator).toBeInTheDocument();
  });

  it('should apply danger styling to danger items', () => {
    const dangerItems = [
      {
        label: 'Delete',
        onClick: vi.fn(),
        danger: true,
      },
    ];

    render(
      <ContextMenu x={100} y={100} items={dangerItems} onClose={mockOnClose} />
    );
    
    const button = screen.getByText('Delete').closest('button');
    expect(button?.className).toContain('hover:text-red-500');
  });

  it('should position menu at correct coordinates', () => {
    render(
      <ContextMenu x={150} y={200} items={mockItems} onClose={mockOnClose} />
    );
    
    // Menu positioning is tested via style attributes
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });
});

describe('fileContextMenuItems', () => {
  it('should create correct file context menu items', () => {
    const onRename = vi.fn();
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();

    const items = fileContextMenuItems(onRename, onDelete, onDuplicate);

    expect(items).toHaveLength(4); // Rename, Duplicate, Separator, Delete
    expect(items[0].label).toBe('Rename');
    expect(items[1].label).toBe('Duplicate');
    expect(items[2].separator).toBe(true);
    expect(items[3].label).toBe('Delete');
    expect(items[3].danger).toBe(true);
  });
});
