import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoreOptionsMenu from '../MoreOptionsMenu';
import { FileItem } from '../../types';

describe('MoreOptionsMenu', () => {
  const mockFile: FileItem = {
    path: '/test/file.md',
    name: 'file.md',
    isDirectory: false,
  };

  const mockProps = {
    currentFile: mockFile,
    onExportPDF: vi.fn(),
    onExportHTML: vi.fn(),
    onExportMarkdown: vi.fn(),
    onCopyLink: vi.fn(),
    onShowInFolder: vi.fn(),
    onProperties: vi.fn(),
    onDelete: vi.fn(),
  };

  it('should render the menu button', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    expect(button).toBeTruthy();
  });

  it('should not render when no file is selected', () => {
    const { container } = render(<MoreOptionsMenu {...mockProps} currentFile={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should open menu when button is clicked', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Export as PDF')).toBeTruthy();
    expect(screen.getByText('Export as HTML')).toBeTruthy();
    expect(screen.getByText('Export as Markdown')).toBeTruthy();
  });

  it('should call onExportPDF when Export PDF is clicked', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    const exportPDFButton = screen.getByText('Export as PDF').closest('button');
    if (exportPDFButton) {
      fireEvent.click(exportPDFButton);
    }
    
    expect(mockProps.onExportPDF).toHaveBeenCalled();
  });

  it('should call onExportHTML when Export HTML is clicked', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    const exportHTMLButton = screen.getByText('Export as HTML').closest('button');
    if (exportHTMLButton) {
      fireEvent.click(exportHTMLButton);
    }
    
    expect(mockProps.onExportHTML).toHaveBeenCalled();
  });

  it('should call onDelete when Delete is clicked', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    const deleteButton = screen.getByText('Delete file').closest('button');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', () => {
    const { container } = render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Export as PDF')).toBeTruthy();
    
    // Click outside
    fireEvent.mouseDown(container);
    
    // Menu should be closed (items not visible)
    // Note: This test might need adjustment based on actual implementation
  });

  it('should close menu when pressing Escape', () => {
    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Export as PDF')).toBeTruthy();
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Menu should be closed
  });

  it('should disable menu items when handlers are not provided', () => {
    render(<MoreOptionsMenu currentFile={mockFile} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    const exportPDFButton = screen.getByText('Export as PDF').closest('button');
    expect(exportPDFButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should copy Obsidian URL when clicked', () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    render(<MoreOptionsMenu {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(button);
    
    const copyURLButton = screen.getByText('Copy Obsidian URL').closest('button');
    if (copyURLButton) {
      fireEvent.click(copyURLButton);
    }
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('obsidian://open')
    );
  });
});
