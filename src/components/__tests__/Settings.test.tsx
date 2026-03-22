import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../Settings';

describe('Settings', () => {
  const mockOnClose = vi.fn();

  const getThemeSelect = () => screen.getAllByRole('combobox')[0] as HTMLSelectElement;
  const getFontSizeSlider = () => screen.getAllByRole('slider')[0] as HTMLInputElement;
  const getAutoSaveCheckbox = () => screen.getAllByRole('checkbox')[0] as HTMLInputElement;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render settings dialog', () => {
    render(<Settings onClose={mockOnClose} />);
    
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('appearance')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
  });

  it('should close when close button is clicked', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should load settings from localStorage', () => {
    const savedSettings = {
      fontSize: 16,
      autoSave: false,
    };
    localStorage.setItem('appSettings', JSON.stringify(savedSettings));
    
    render(<Settings onClose={mockOnClose} />);
    
    expect(getFontSizeSlider().value).toBe('16');
    expect(getAutoSaveCheckbox().checked).toBe(false);
  });

  it('should update theme setting', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const themeSelect = getThemeSelect();
    fireEvent.change(themeSelect, { target: { value: 'light' } });
    
    expect(themeSelect.value).toBe('light');
  });

  it('should update font size', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = getFontSizeSlider();
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    expect(screen.getByText(/fontSize/)).toBeInTheDocument();
    expect(fontSizeSlider.value).toBe('18');
  });

  it('should toggle auto save', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const autoSaveCheckbox = getAutoSaveCheckbox();
    const initialValue = autoSaveCheckbox.checked;
    
    fireEvent.click(autoSaveCheckbox);
    expect(autoSaveCheckbox.checked).toBe(!initialValue);
  });

  it('should save settings to localStorage', async () => {
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = getFontSizeSlider();
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    const saveButton = screen.getByText('save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      const saved = localStorage.getItem('appSettings');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.fontSize).toBe(18);
    });
  });

  it('should reset to defaults', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = getFontSizeSlider();
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    const resetButton = screen.getByText('reset');
    fireEvent.click(resetButton);
    
    expect(getFontSizeSlider().value).toBe('14');
  });

  it('should disable save button when no changes', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const saveButton = screen.getByText('save') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when changes are made', () => {
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = getFontSizeSlider();
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    const saveButton = screen.getByText('save') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });

  it('should dispatch settingsChanged event on save', async () => {
    const eventListener = vi.fn();
    window.addEventListener('settingsChanged', eventListener);
    
    render(<Settings onClose={mockOnClose} />);
    
    const fontSizeSlider = getFontSizeSlider();
    fireEvent.change(fontSizeSlider, { target: { value: '18' } });
    
    const saveButton = screen.getByText('save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(eventListener).toHaveBeenCalled();
    });
    
    window.removeEventListener('settingsChanged', eventListener);
  });
});
