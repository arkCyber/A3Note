import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../Settings';

describe('Settings', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render settings dialog', () => {
    render(<Settings onClose={mockOnClose} />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('should close when close button is clicked', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should load settings from localStorage', () => {
    const savedSettings = {
      theme: 'light',
      fontSize: 16,
      autoSave: false,
    };
    localStorage.setItem('appSettings', JSON.stringify(savedSettings));
    
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(themeSelect.value).toBe('light');
  });

  it('should update theme setting', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    expect(themeSelect.value).toBe('light');
  });

  it('should update font size', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = screen.getByLabelText(/Font Size:/);
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    expect(screen.getByText(/Font Size: 18px/)).toBeInTheDocument();
  });

  it('should toggle auto save', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const autoSaveCheckbox = screen.getByLabelText('Auto Save') as HTMLInputElement;
    const initialValue = autoSaveCheckbox.checked;
    
    fireEvent.click(autoSaveCheckbox);
    expect(autoSaveCheckbox.checked).toBe(!initialValue);
  });

  it('should save settings to localStorage', async () => {
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox');
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      const saved = localStorage.getItem('appSettings');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.theme).toBe('light');
    });
  });

  it('should reset to defaults', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    const resetButton = screen.getByText('Reset to Defaults');
    fireEvent.click(resetButton);
    
    expect(themeSelect.value).toBe('dark');
  });

  it('should disable save button when no changes', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const saveButton = screen.getByText('Save Changes') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when changes are made', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox');
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    const saveButton = screen.getByText('Save Changes') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });

  it('should dispatch settingsChanged event on save', async () => {
    const eventListener = vi.fn();
    window.addEventListener('settingsChanged', eventListener);
    
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = screen.getByRole('combobox');
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(eventListener).toHaveBeenCalled();
    });
    
    window.removeEventListener('settingsChanged', eventListener);
  });
});
