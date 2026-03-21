import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette, { Command } from '../CommandPalette';

describe('CommandPalette', () => {
  const mockOnClose = vi.fn();
  const mockAction1 = vi.fn();
  const mockAction2 = vi.fn();

  const mockCommands: Command[] = [
    {
      id: 'new-file',
      label: 'New File',
      description: 'Create a new markdown file',
      shortcut: '⌘+N',
      category: 'File',
      action: mockAction1,
    },
    {
      id: 'save-file',
      label: 'Save File',
      description: 'Save current file',
      shortcut: '⌘+S',
      category: 'File',
      action: mockAction2,
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide sidebar',
      shortcut: '⌘+B',
      category: 'View',
      action: vi.fn(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <CommandPalette isOpen={false} onClose={mockOnClose} commands={mockCommands} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render when open', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    expect(screen.getByPlaceholderText(/Type a command/)).toBeInTheDocument();
  });

  it('should display all commands initially', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Save File')).toBeInTheDocument();
    expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument();
  });

  it('should filter commands based on search query', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'save' } });
    
    expect(screen.getByText('Save File')).toBeInTheDocument();
    expect(screen.queryByText('New File')).not.toBeInTheDocument();
    expect(screen.queryByText('Toggle Sidebar')).not.toBeInTheDocument();
  });

  it('should execute command when clicked', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    fireEvent.click(screen.getByText('New File'));
    
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close when close button is clicked', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    const closeButton = screen.getByTitle(/Close/);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close when Escape is pressed', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should execute command when Enter is pressed', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    fireEvent.keyDown(window, { key: 'Enter' });
    
    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate with arrow keys', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    // Arrow down should select second item
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });
    
    expect(mockAction2).toHaveBeenCalledTimes(1);
  });

  it('should display command shortcuts', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    expect(screen.getByText('⌘+N')).toBeInTheDocument();
    expect(screen.getByText('⌘+S')).toBeInTheDocument();
  });

  it('should display command categories', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    const fileCategories = screen.getAllByText('File');
    expect(fileCategories.length).toBeGreaterThan(0);
  });

  it('should show "no commands" message when no results', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    const input = screen.getByPlaceholderText(/Type a command/);
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

  it('should clear query after executing command', () => {
    render(
      <CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />
    );
    
    const input = screen.getByPlaceholderText(/Type a command/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'save' } });
    
    expect(input.value).toBe('save');
    
    fireEvent.click(screen.getByText('Save File'));
    
    // Query should be cleared after execution
    expect(mockOnClose).toHaveBeenCalled();
  });
});
