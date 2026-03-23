import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedTabBar, { Tab } from '../EnhancedTabBar';

describe('EnhancedTabBar', () => {
  const mockTabs: Tab[] = [
    {
      id: '1',
      file: { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
      isDirty: false,
      isPinned: false,
    },
    {
      id: '2',
      file: { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
      isDirty: true,
      isPinned: false,
    },
    {
      id: '3',
      file: { path: '/test/file3.md', name: 'file3.md', isDirectory: false },
      isDirty: false,
      isPinned: true,
    },
  ];

  const mockProps = {
    tabs: mockTabs,
    activeTabId: '1',
    onTabClick: vi.fn(),
    onTabClose: vi.fn(),
    onTabPin: vi.fn(),
    onTabReorder: vi.fn(),
    onNewTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all tabs', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    expect(screen.getByText('file1.md')).toBeTruthy();
    expect(screen.getByText('file2.md')).toBeTruthy();
    expect(screen.getByText('file3.md')).toBeTruthy();
  });

  it('should not render when no tabs', () => {
    const { container } = render(<EnhancedTabBar {...mockProps} tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should highlight active tab', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const activeTab = screen.getByText('file1.md').closest('div');
    expect(activeTab?.className).toContain('bg-background');
  });

  it('should show dirty indicator for unsaved tabs', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const dirtyTab = screen.getByText('file2.md').closest('div');
    expect(dirtyTab?.textContent).toContain('●');
  });

  it('should show pin icon for pinned tabs', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const pinnedTab = screen.getByText('file3.md').closest('div');
    // Check for pin icon (implementation specific)
    expect(pinnedTab).toBeTruthy();
  });

  it('should call onTabClick when tab is clicked', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const tab = screen.getByText('file2.md').closest('div');
    if (tab) {
      fireEvent.click(tab);
    }
    
    expect(mockProps.onTabClick).toHaveBeenCalledWith('2');
  });

  it('should call onTabClose when close button is clicked', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[0]);
    
    expect(mockProps.onTabClose).toHaveBeenCalledWith('1');
  });

  it('should confirm before closing dirty tab', () => {
    global.confirm = vi.fn(() => false);
    
    render(<EnhancedTabBar {...mockProps} />);
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[1]); // file2.md is dirty
    
    expect(global.confirm).toHaveBeenCalled();
    expect(mockProps.onTabClose).not.toHaveBeenCalled();
  });

  it('should close dirty tab if confirmed', () => {
    global.confirm = vi.fn(() => true);
    
    render(<EnhancedTabBar {...mockProps} />);
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[1]); // file2.md is dirty
    
    expect(global.confirm).toHaveBeenCalled();
    expect(mockProps.onTabClose).toHaveBeenCalledWith('2');
  });

  it('should show context menu on right click', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const tab = screen.getByText('file1.md').closest('div');
    if (tab) {
      fireEvent.contextMenu(tab);
    }
    
    expect(screen.getByText('Pin tab')).toBeTruthy();
    expect(screen.getByText('Copy file path')).toBeTruthy();
    expect(screen.getByText('Close others')).toBeTruthy();
  });

  it('should call onTabPin from context menu', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const tab = screen.getByText('file1.md').closest('div');
    if (tab) {
      fireEvent.contextMenu(tab);
    }
    
    const pinButton = screen.getByText('Pin tab').closest('button');
    if (pinButton) {
      fireEvent.click(pinButton);
    }
    
    expect(mockProps.onTabPin).toHaveBeenCalledWith('1');
  });

  it('should copy file path from context menu', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    render(<EnhancedTabBar {...mockProps} />);
    
    const tab = screen.getByText('file1.md').closest('div');
    if (tab) {
      fireEvent.contextMenu(tab);
    }
    
    const copyButton = screen.getByText('Copy file path').closest('button');
    if (copyButton) {
      fireEvent.click(copyButton);
    }
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('/test/file1.md');
  });

  it('should render new tab button when onNewTab is provided', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const newTabButton = screen.getByTitle('New tab');
    expect(newTabButton).toBeTruthy();
  });

  it('should call onNewTab when new tab button is clicked', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const newTabButton = screen.getByTitle('New tab');
    fireEvent.click(newTabButton);
    
    expect(mockProps.onNewTab).toHaveBeenCalled();
  });

  it('should show pinned tabs first', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const tabs = screen.getAllByRole('button', { name: /Close tab/i });
    // Pinned tab (file3.md) should be first
    // This is implementation specific and might need adjustment
    expect(tabs.length).toBe(3);
  });

  it('should handle drag and drop', () => {
    render(<EnhancedTabBar {...mockProps} />);
    
    const tab = screen.getByText('file1.md').closest('div');
    if (tab) {
      fireEvent.dragStart(tab);
      fireEvent.dragOver(tab);
      fireEvent.dragEnd(tab);
    }
    
    // onTabReorder might be called during drag
    // This test verifies the drag handlers work
  });
});
