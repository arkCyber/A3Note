import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import * as tauriApi from '@tauri-apps/api/core';
import * as tauriDialog from '@tauri-apps/plugin-dialog';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core');
vi.mock('@tauri-apps/plugin-dialog');

describe('App Integration - All Buttons and Menus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock workspace data
    vi.mocked(tauriApi.invoke).mockImplementation((cmd: string) => {
      if (cmd === 'list_files') {
        return Promise.resolve([
          { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
          { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
        ]);
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
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByTitle('Toggle sidebar')).toBeInTheDocument();
        expect(screen.getByTitle('Open workspace')).toBeInTheDocument();
        expect(screen.getByTitle(/New file/)).toBeInTheDocument();
        expect(screen.getByTitle(/Save/)).toBeInTheDocument();
        expect(screen.getByTitle(/Search/)).toBeInTheDocument();
        expect(screen.getByTitle('Settings')).toBeInTheDocument();
      });
    });

    it('should toggle sidebar when sidebar button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('Files')).toBeInTheDocument();
      });
      
      const sidebarButton = screen.getByTitle('Toggle sidebar');
      fireEvent.click(sidebarButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Files')).not.toBeInTheDocument();
      });
    });

    it('should open Settings when Settings button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('Settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Appearance')).toBeInTheDocument();
      });
    });

    it('should close Settings when close button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('Settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
      });
    });

    it('should toggle search panel when search button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const searchButton = screen.getByTitle(/Search/);
        fireEvent.click(searchButton);
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/)).toBeInTheDocument();
      });
    });

    it('should disable save button when no changes', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const saveButton = screen.getByTitle(/Save/);
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open command palette with ⌘+P', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search commands/)).toBeInTheDocument();
      });
    });

    it('should toggle sidebar with ⌘+B', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('Files')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'b', metaKey: true });
      
      await waitFor(() => {
        expect(screen.queryByText('Files')).not.toBeInTheDocument();
      });
    });

    it('should toggle search with ⌘+Shift+F', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'f', metaKey: true, shiftKey: true });
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/)).toBeInTheDocument();
      });
    });

    it('should toggle preview with ⌘+E', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
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
      const confirmSpy = vi.spyOn(window, 'prompt').mockReturnValue('test.md');
      
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Search commands/);
        fireEvent.change(input, { target: { value: 'new' } });
      });
      
      await waitFor(() => {
        const newFileCommand = screen.getByText('New File');
        fireEvent.click(newFileCommand);
      });
      
      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should execute Toggle Sidebar command', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText('Files')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'p', metaKey: true });
      });
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Search commands/);
        fireEvent.change(input, { target: { value: 'sidebar' } });
      });
      
      await waitFor(() => {
        const toggleCommand = screen.getByText('Toggle Sidebar');
        fireEvent.click(toggleCommand);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Files')).not.toBeInTheDocument();
      });
    });
  });

  describe('Settings Panel', () => {
    it('should show all settings sections', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('Settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Appearance')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();
        expect(screen.getByText('Behavior')).toBeInTheDocument();
      });
    });

    it('should save settings when Save button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('Settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);
      });
      
      // Settings should be saved to localStorage
      expect(localStorage.getItem('appSettings')).toBeTruthy();
    });

    it('should reset settings when Reset button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const settingsButton = screen.getByTitle('Settings');
        fireEvent.click(settingsButton);
      });
      
      await waitFor(() => {
        const resetButton = screen.getByText('Reset to Defaults');
        fireEvent.click(resetButton);
      });
      
      // Should reset to default values
      await waitFor(() => {
        const saveButton = screen.getByText('Save');
        expect(saveButton).toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme when theme button clicked', async () => {
      render(<App />);
      
      const openButton = screen.getByTitle('Open workspace');
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
