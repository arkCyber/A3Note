/**
 * Plugin Marketplace Tests
 * Tests for the plugin marketplace UI and functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PluginMarketplace from '../components/PluginMarketplace';
import { app } from '../plugins/api/App';

describe('Plugin Marketplace', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    app.initialize('/test/workspace');
  });

  describe('Rendering', () => {
    it('should render marketplace with title', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText('Plugin Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Browse and install community plugins')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should render category filters', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      // Categories appear in both filter buttons and plugin tags
      const allCategories = screen.getAllByText('all');
      expect(allCategories.length).toBeGreaterThan(0);
      
      const productivityCategories = screen.getAllByText('productivity');
      expect(productivityCategories.length).toBeGreaterThan(0);
    });

    it('should render plugin cards', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Dataview')).toBeInTheDocument();
      expect(screen.getByText('Templater')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const closeButton = screen.getByTitle('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter plugins by name', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'calendar' } });
      
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.queryByText('Dataview')).not.toBeInTheDocument();
    });

    it('should filter plugins by description', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'data views' } });
      
      expect(screen.getByText('Dataview')).toBeInTheDocument();
    });

    it('should filter plugins by author', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'Liam' } });
      
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    it('should show no results message when no matches', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText('No plugins found matching your search.')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter by category', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      // 'productivity' appears in both category buttons and plugin tags
      const productivityButtons = screen.getAllByText('productivity');
      fireEvent.click(productivityButtons[0]); // Click the first one (category button)
      
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Templater')).toBeInTheDocument();
    });

    it('should highlight selected category', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      // 'all' should be the first category button and should have bg-primary class
      const allButtons = screen.getAllByText('all');
      expect(allButtons[0]).toHaveClass('bg-primary');
    });

    it('should show all plugins when "all" is selected', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const allButtons = screen.getAllByText('all');
      fireEvent.click(allButtons[0]);
      
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Dataview')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by downloads by default', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toHaveValue('downloads');
    });

    it('should sort by rating', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'rating' } });
      
      expect(sortSelect).toHaveValue('rating');
    });

    it('should sort by name', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      
      expect(sortSelect).toHaveValue('name');
    });
  });

  describe('Plugin Installation', () => {
    it('should show install button for non-installed plugins', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const installButtons = screen.getAllByText('Install');
      expect(installButtons.length).toBeGreaterThan(0);
    });

    it('should show installing state when clicked', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const installButton = screen.getAllByText('Install')[0];
      fireEvent.click(installButton);
      
      await waitFor(() => {
        expect(screen.getByText('Installing...')).toBeInTheDocument();
      });
    });

    it('should disable install button during installation', async () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const installButton = screen.getAllByText('Install')[0];
      fireEvent.click(installButton);
      
      await waitFor(() => {
        const installingButton = screen.getByText('Installing...');
        expect(installingButton).toBeDisabled();
      });
    });
  });

  describe('Plugin Information Display', () => {
    it('should display plugin version', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText(/v1.5.10/)).toBeInTheDocument();
    });

    it('should display download count', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText(/125k downloads/)).toBeInTheDocument();
    });

    it('should display rating', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });

    it('should display tags', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      // Tags appear in both category filters and plugin cards
      const calendarTags = screen.getAllByText('calendar');
      expect(calendarTags.length).toBeGreaterThan(0);
      
      const dailyNotesTags = screen.getAllByText('daily-notes');
      expect(dailyNotesTags.length).toBeGreaterThan(0);
    });

    it('should display author name', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText(/by Liam Cain/)).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('should have GitHub links for each plugin', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const githubLinks = screen.getAllByTitle('View on GitHub');
      expect(githubLinks.length).toBeGreaterThan(0);
    });

    it('should open GitHub links in new tab', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const githubLink = screen.getAllByTitle('View on GitHub')[0];
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Plugin Count Display', () => {
    it('should show total plugin count', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      expect(screen.getByText(/Showing \d+ of \d+ plugins/)).toBeInTheDocument();
    });

    it('should update count when filtering', () => {
      render(<PluginMarketplace onClose={mockOnClose} />);
      
      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'calendar' } });
      
      expect(screen.getByText(/Showing 1 of \d+ plugins/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive grid classes', () => {
      const { container } = render(<PluginMarketplace onClose={mockOnClose} />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });
  });
});
