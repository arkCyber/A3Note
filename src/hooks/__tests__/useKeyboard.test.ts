import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from '../useKeyboard';

describe('useKeyboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register keyboard event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
  });

  it('should remove keyboard event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const mockCallback = vi.fn();
    
    const { unmount } = renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('should call callback when Cmd+S is pressed', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should call callback when Ctrl+S is pressed', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', ctrl: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should support multiple shortcuts', () => {
    const saveCallback = vi.fn();
    const newCallback = vi.fn();
    
    renderHook(() => useKeyboard([
      { key: 's', meta: true, callback: saveCallback },
      { key: 'n', meta: true, callback: newCallback },
    ]));
    
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }));
    expect(saveCallback).toHaveBeenCalledTimes(1);
    expect(newCallback).not.toHaveBeenCalled();
    
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', metaKey: true, bubbles: true }));
    expect(newCallback).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior for matched shortcuts', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    window.dispatchEvent(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call callback for non-matching keys', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      metaKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should not call callback when modifier keys do not match', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', meta: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true, // ctrl instead of meta
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle shortcuts with shift modifier', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 'S', meta: true, shift: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 'S',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle shortcuts with alt modifier', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 's', alt: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      altKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle empty shortcuts array', () => {
    renderHook(() => useKeyboard([]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    
    expect(() => window.dispatchEvent(event)).not.toThrow();
  });

  it('should update shortcuts when they change', () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    
    const { rerender } = renderHook(
      ({ shortcuts }) => useKeyboard(shortcuts),
      { initialProps: { shortcuts: [{ key: 's', meta: true, callback: firstCallback }] } }
    );
    
    rerender({ shortcuts: [{ key: 's', meta: true, callback: secondCallback }] });
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
  });

  it('should be case-insensitive for key matching', () => {
    const mockCallback = vi.fn();
    
    renderHook(() => useKeyboard([{ key: 'S', meta: true, callback: mockCallback }]));
    
    const event = new KeyboardEvent('keydown', {
      key: 's', // lowercase
      metaKey: true,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
