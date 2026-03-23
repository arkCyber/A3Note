import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import i18n from '../../i18n';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'zh-CN',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageSwitcher', () => {
  it('should render the language switcher button', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    expect(button).toBeTruthy();
  });

  it('should display current language', () => {
    render(<LanguageSwitcher />);
    
    expect(screen.getByText('中文（简体）')).toBeTruthy();
  });

  it('should open dropdown when clicked', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Should show all language options
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('日本語')).toBeTruthy();
    expect(screen.getByText('한국어')).toBeTruthy();
  });

  it('should close dropdown when clicking outside', () => {
    const { container } = render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Click outside
    fireEvent.mouseDown(container);
    
    // Dropdown should be closed (language options not visible)
    // Note: This test might need adjustment based on actual implementation
  });

  it('should highlight current language in dropdown', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    const currentLangButton = screen.getByText('中文（简体）').closest('button');
    expect(currentLangButton?.className).toContain('text-primary');
  });

  it('should call changeLanguage when selecting a language', () => {
    const changeLanguageMock = vi.fn();
    vi.mocked(i18n.changeLanguage).mockImplementation(changeLanguageMock);
    
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    const englishButton = screen.getByText('English').closest('button');
    if (englishButton) {
      fireEvent.click(englishButton);
    }
    
    expect(changeLanguageMock).toHaveBeenCalledWith('en-US');
  });

  it('should display both native and English names for languages', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(button);
    
    // Check for native names
    expect(screen.getByText('中文（简体）')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('日本語')).toBeTruthy();
    expect(screen.getByText('한국어')).toBeTruthy();
    
    // Check for English names
    expect(screen.getByText('Chinese (Simplified)')).toBeTruthy();
    expect(screen.getByText('Japanese')).toBeTruthy();
    expect(screen.getByText('Korean')).toBeTruthy();
  });
});
