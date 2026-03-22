import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import * as tauriApi from '@tauri-apps/api/core';
import * as tauriDialog from '@tauri-apps/plugin-dialog';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core');
vi.mock('@tauri-apps/plugin-dialog');

describe('App Integration - All Buttons and Menus', () => {
  const getOpenWorkspaceButton = () => screen.getByRole('button', { name: /Open Workspace/i });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock workspace data
    vi.mocked(tauriApi.invoke).mockImplementation((cmd: string) => {
      if (cmd === 'list_directory') {
        return Promise.resolve([
          { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
          { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
        ]);
      }
      if (cmd === 'create_file' || cmd === 'write_file_content' || cmd === 'delete_file') {
        return Promise.resolve(undefined);
      }
      if (cmd === 'read_file_content') {
        return Promise.resolve({ path: '/test/file1.md', content: '# Test' });
      }
      return Promise.resolve(null);
    });
    
    vi.mocked(tauriDialog.open).mockResolvedValue('/test/workspace');
  });

  describe('Toolbar Buttons', () => {
    it('should render all toolbar buttons', async () => {
      render(<App />);
      
      // Open workspace first
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByTitle('toggleSidebar')).toBeInTheDocument();
        expect(screen.getByTitle('openWorkspace')).toBeInTheDocument();
        expect(screen.getByTitle('newFileShortcut')).toBeInTheDocument();
        expect(screen.getByTitle('saveShortcut')).toBeInTheDocument();
        expect(screen.getByTitle('searchShortcut')).toBeInTheDocument();
        expect(screen.getByTitle('settings')).toBeInTheDocument();
      });
    });

    it('should toggle sidebar when sidebar button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('title')).toBeInTheDocument();
      });
      
      const sidebarButton = screen.getByTitle('toggleSidebar');
      fireEvent.click(sidebarButton);
      
      await waitFor(() => {
        expect(screen.queryByText('title')).not.toBeInTheDocument();
      });
    });

    it('should open Settings when Settings button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('appearance')).toBeInTheDocument();
      });
    });

    it('should close Settings when close button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('appearance')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTitle('close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('appearance')).not.toBeInTheDocument();
      });
    });

    it('should toggle search panel when search button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const searchButton = screen.getByTitle('searchShortcut');
        fireEvent.click(searchButton);
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search in files...')).toBeInTheDocument();
      });
    });

    it('should disable save button when no changes', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const saveButton = screen.getByTitle('saveShortcut');
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open command palette with ⌘+P', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
      });
    });

    it('should toggle sidebar with ⌘+B', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('title')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'b', metaKey: true });
      
      await waitFor(() => {
        expect(screen.queryByText('title')).not.toBeInTheDocument();
      });
    });

    it('should toggle search with ⌘+Shift+F', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'f', metaKey: true, shiftKey: true });
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search in files...')).toBeInTheDocument();
      });
    });

    it('should toggle preview with ⌘+E', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'e', metaKey: true });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });
  });

  describe('CommandPalette Commands', () => {
    it('should execute New File command', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type a command or search...');
        fireEvent.change(input, { target: { value: 'new' } });
      });
      
      await waitFor(() => {
        const newFileCommand = screen.getByText('New File');
        fireEvent.click(newFileCommand);
      });
      
      expect(screen.queryByText('New File')).not.toBeInTheDocument();
    });

    it('should execute Toggle Sidebar command', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('title')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type a command or search...');
        fireEvent.change(input, { target: { value: 'sidebar' } });
      });
      
      await waitFor(() => {
        const toggleCommand = screen.getByText('Toggle Sidebar');
        fireEvent.click(toggleCommand);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Settings Panel', () => {
    it('should show all settings sections', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('appearance')).toBeInTheDocument();
        expect(screen.getByText('editor')).toBeInTheDocument();
      });
    });

    it('should save settings when Save button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        const sliders = screen.getAllByRole('slider');
        fireEvent.change(sliders[0], { target: { value: '18' } });
        const saveButton = screen.getByText('save');
        fireEvent.click(saveButton);
      });
      
      // Settings should be saved to localStorage
      expect(localStorage.getItem('appSettings')).toBeTruthy();
    });

    it('should reset settings when Reset button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        const resetButton = screen.getByText('reset');
        fireEvent.click(resetButton);
      });
      
      // Should reset to default values
      await waitFor(() => {
        const saveButton = screen.getByText('save');
        expect(saveButton).toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme when theme button clicked', async () => {
      render(<App />);
      
      const openButton = getOpenWorkspaceButton();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const themeButton = screen.getByRole('button', { name: /Switch to light mode/ });
        fireEvent.click(themeButton);
      });
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });
  });
});
