import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabBar, { Tab } from '../TabBar';

describe('TabBar', () => {
  const mockOnTabClick = vi.fn();
  const mockOnTabClose = vi.fn();

  const mockTabs: Tab[] = [
    {
      id: '1',
      file: { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
      isDirty: false,
    },
    {
      id: '2',
      file: { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
      isDirty: true,
    },
    {
      id: '3',
      file: { path: '/test/file3.md', name: 'file3.md', isDirectory: false },
      isDirty: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no tabs', () => {
    const { container } = render(
      <TabBar
        tabs={[]}
        activeTabId={null}
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render all tabs', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    expect(screen.getByText('file1.md')).toBeInTheDocument();
    expect(screen.getByText('file2.md')).toBeInTheDocument();
    expect(screen.getByText('file3.md')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const activeTab = screen.getByText('file1.md').closest('div');
    expect(activeTab?.className).toContain('bg-background');
  });

  it('should call onTabClick when tab is clicked', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    fireEvent.click(screen.getByText('file2.md'));
    
    expect(mockOnTabClick).toHaveBeenCalledWith('2');
  });

  it('should show dirty indicator for unsaved tabs', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const dirtyIndicators = screen.getAllByText('●');
    expect(dirtyIndicators).toHaveLength(1);
  });

  it('should close tab without confirmation when not dirty', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[0]);
    
    expect(mockOnTabClose).toHaveBeenCalledWith('1');
  });

  it('should ask confirmation when closing dirty tab', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="2"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[1]);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnTabClose).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('should close dirty tab when confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="2"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[1]);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnTabClose).toHaveBeenCalledWith('2');
    
    confirmSpy.mockRestore();
  });

  it('should stop propagation when closing tab', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[0]);
    
    expect(mockOnTabClick).not.toHaveBeenCalled();
    expect(mockOnTabClose).toHaveBeenCalledWith('1');
  });

  it('should truncate long file names', () => {
    const longNameTab: Tab = {
      id: '4',
      file: { 
        path: '/test/very-long-file-name-that-should-be-truncated.md', 
        name: 'very-long-file-name-that-should-be-truncated.md', 
        isDirectory: false 
      },
      isDirty: false,
    };
    
    const { container } = render(
      <TabBar
        tabs={[longNameTab]}
        activeTabId="4"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const tabElement = container.querySelector('.truncate');
    expect(tabElement).toBeInTheDocument();
  });

  it('should handle null activeTabId', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId={null}
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
      />
    );
    
    const tabs = screen.getAllByText(/file\d\.md/);
    tabs.forEach(tab => {
      const tabElement = tab.closest('div');
      expect(tabElement?.className).not.toContain('bg-background text-foreground');
    });
  });
});
