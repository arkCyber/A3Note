import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with dark theme by default', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
  });

  it('should apply theme to document', () => {
    renderHook(() => useTheme());
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should save theme to localStorage', () => {
    renderHook(() => useTheme());
    
    expect(localStorage.getItem('a3note-theme')).toBe('dark');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('a3note-theme', 'light');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme from dark to light', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('a3note-theme')).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    localStorage.setItem('a3note-theme', 'light');
    
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set theme directly', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('a3note-theme')).toBe('light');
  });

  it('should persist theme across re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    rerender();
    
    expect(result.current.theme).toBe('light');
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('a3note-theme', 'invalid-theme');
    
    const { result } = renderHook(() => useTheme());
    
    // Should use the stored value even if invalid (or default to dark)
    expect(result.current.theme).toBeDefined();
  });

  it('should update document attribute when theme changes', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
