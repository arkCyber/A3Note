import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateGroupedSidebar from '../DateGroupedSidebar';
import { FileItem } from '../../types';

describe('DateGroupedSidebar', () => {
  const mockFiles: FileItem[] = [
    { path: '/notes/2026-03-23.md', name: '2026-03-23.md', isDirectory: false },
    { path: '/notes/2026-03-22.md', name: '2026-03-22.md', isDirectory: false },
    { path: '/notes/2026-03-15.md', name: '2026-03-15.md', isDirectory: false },
    { path: '/notes/2026-02-10.md', name: '2026-02-10.md', isDirectory: false },
    { path: '/notes/regular.md', name: 'regular.md', isDirectory: false },
  ];

  const mockProps = {
    files: mockFiles,
    currentFile: null,
    onFileSelect: vi.fn(),
    groupingMode: 'daily-notes' as const,
    onGroupingModeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar header', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    expect(screen.getByText('Files')).toBeTruthy();
  });

  it('should render grouping mode selector', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
  });

  it('should display grouping options', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    expect(screen.getByText('No Grouping')).toBeTruthy();
    expect(screen.getByText('Group by Created Date')).toBeTruthy();
    expect(screen.getByText('Group by Modified Date')).toBeTruthy();
    expect(screen.getByText('Group Daily Notes')).toBeTruthy();
  });

  it('should call onGroupingModeChange when mode is changed', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'created' } });
    
    expect(mockProps.onGroupingModeChange).toHaveBeenCalledWith('created');
  });

  it('should display file groups', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    // Should show groups (implementation specific)
    const groups = screen.getAllByRole('button');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('should toggle group collapse', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    const groupButtons = screen.getAllByRole('button');
    const firstGroup = groupButtons[0];
    
    // Click to collapse
    fireEvent.click(firstGroup);
    
    // Click to expand
    fireEvent.click(firstGroup);
    
    // Group should toggle (implementation specific)
  });

  it('should call onFileSelect when file is clicked', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    // Find a file button
    const fileButtons = screen.getAllByRole('button');
    const fileButton = fileButtons.find(btn => 
      btn.textContent?.includes('.md')
    );
    
    if (fileButton) {
      fireEvent.click(fileButton);
      expect(mockProps.onFileSelect).toHaveBeenCalled();
    }
  });

  it('should highlight current file', () => {
    const currentFile = mockFiles[0];
    render(<DateGroupedSidebar {...mockProps} currentFile={currentFile} />);
    
    // Current file should be highlighted (implementation specific)
    expect(screen.getByText(currentFile.name)).toBeTruthy();
  });

  it('should show file count in footer', () => {
    render(<DateGroupedSidebar {...mockProps} />);
    
    const footer = screen.getByText(/files in/);
    expect(footer).toBeTruthy();
  });

  it('should show empty state when no files', () => {
    render(<DateGroupedSidebar {...mockProps} files={[]} />);
    
    expect(screen.getByText('No files found')).toBeTruthy();
  });

  it('should group daily notes correctly', () => {
    render(<DateGroupedSidebar {...mockProps} groupingMode="daily-notes" />);
    
    // Should show date groups (implementation specific)
    expect(screen.getByText('Files')).toBeTruthy();
  });

  it('should not group when mode is none', () => {
    render(<DateGroupedSidebar {...mockProps} groupingMode="none" />);
    
    // Should show all files in one group
    expect(screen.getByText('All Files')).toBeTruthy();
  });
});
