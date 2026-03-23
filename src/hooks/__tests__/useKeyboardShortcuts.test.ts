// useKeyboardShortcuts Hook Tests - Aerospace Grade

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS, formatShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts Hook', () => {
  let mockAction1: any;
  let mockAction2: any;

  beforeEach(() => {
    mockAction1 = vi.fn();
    mockAction2 = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should register shortcuts on mount', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      const { result } = renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      expect(result.current.shortcuts).toEqual(shortcuts);
    });

    it('should not register shortcuts when disabled', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: false, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut Triggering', () => {
    it('should trigger action on matching shortcut', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
    });

    it('should not trigger action on non-matching key', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).not.toHaveBeenCalled();
    });

    it('should handle Shift modifier', () => {
      const shortcuts = [
        { key: 's', ctrl: true, shift: true, description: 'Save As', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
    });

    it('should handle Alt modifier', () => {
      const shortcuts = [
        { key: 's', ctrl: true, alt: true, description: 'Special Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, altKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
    });

    it('should handle Meta key (Mac)', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
    });
  });

  describe('Multiple Shortcuts', () => {
    it('should handle multiple shortcuts', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
        { key: 'o', ctrl: true, description: 'Open', action: mockAction2 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const saveEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(saveEvent);
      expect(mockAction1).toHaveBeenCalled();

      const openEvent = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true });
      window.dispatchEvent(openEvent);
      expect(mockAction2).toHaveBeenCalled();
    });

    it('should only trigger matching shortcut', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
        { key: 's', ctrl: true, shift: true, description: 'Save As', action: mockAction2 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
      expect(mockAction2).not.toHaveBeenCalled();
    });
  });

  describe('Case Insensitivity', () => {
    it('should match shortcuts case-insensitively', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 'S', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).toHaveBeenCalled();
    });
  });

  describe('Event Prevention', () => {
    it('should prevent default behavior on match', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
      
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const shortcuts = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ enabled: true, shortcuts })
      );

      unmount();

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction1).not.toHaveBeenCalled();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update shortcuts when they change', () => {
      const shortcuts1 = [
        { key: 's', ctrl: true, description: 'Save', action: mockAction1 },
      ];

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts({ enabled: true, shortcuts }),
        { initialProps: { shortcuts: shortcuts1 } }
      );

      const shortcuts2 = [
        { key: 'o', ctrl: true, description: 'Open', action: mockAction2 },
      ];

      rerender({ shortcuts: shortcuts2 });

      const event = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockAction2).toHaveBeenCalled();
      expect(mockAction1).not.toHaveBeenCalled();
    });
  });
});

describe('DEFAULT_SHORTCUTS', () => {
  it('should have all required shortcuts', () => {
    expect(DEFAULT_SHORTCUTS.NEW_FILE).toBeDefined();
    expect(DEFAULT_SHORTCUTS.SAVE_FILE).toBeDefined();
    expect(DEFAULT_SHORTCUTS.TOGGLE_SIDEBAR).toBeDefined();
    expect(DEFAULT_SHORTCUTS.COMMAND_PALETTE).toBeDefined();
    expect(DEFAULT_SHORTCUTS.SEARCH).toBeDefined();
    expect(DEFAULT_SHORTCUTS.RAG_CHAT).toBeDefined();
    expect(DEFAULT_SHORTCUTS.GRAPH_VIEW).toBeDefined();
    expect(DEFAULT_SHORTCUTS.TODAY_NOTE).toBeDefined();
  });

  it('should have proper key combinations', () => {
    expect(DEFAULT_SHORTCUTS.NEW_FILE.key).toBe('n');
    expect(DEFAULT_SHORTCUTS.NEW_FILE.ctrl).toBe(true);
    
    expect(DEFAULT_SHORTCUTS.SAVE_FILE.key).toBe('s');
    expect(DEFAULT_SHORTCUTS.SAVE_FILE.ctrl).toBe(true);
    
    expect(DEFAULT_SHORTCUTS.GRAPH_VIEW.key).toBe('g');
    expect(DEFAULT_SHORTCUTS.GRAPH_VIEW.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.GRAPH_VIEW.shift).toBe(true);
  });

  it('should have descriptions', () => {
    expect(DEFAULT_SHORTCUTS.NEW_FILE.description).toBeTruthy();
    expect(DEFAULT_SHORTCUTS.SAVE_FILE.description).toBeTruthy();
    expect(DEFAULT_SHORTCUTS.GRAPH_VIEW.description).toBeTruthy();
  });
});

describe('formatShortcut', () => {
  it('should format Ctrl shortcuts', () => {
    const shortcut = { key: 's', ctrl: true, description: 'Save', action: () => {} };
    const formatted = formatShortcut(shortcut);
    
    expect(formatted).toMatch(/Ctrl\+S|⌘\+S/);
  });

  it('should format Shift shortcuts', () => {
    const shortcut = { key: 's', ctrl: true, shift: true, description: 'Save As', action: () => {} };
    const formatted = formatShortcut(shortcut);
    
    expect(formatted).toContain('Shift');
    expect(formatted).toContain('S');
  });

  it('should format Alt shortcuts', () => {
    const shortcut = { key: 's', ctrl: true, alt: true, description: 'Special', action: () => {} };
    const formatted = formatShortcut(shortcut);
    
    expect(formatted).toContain('Alt');
    expect(formatted).toContain('S');
  });

  it('should uppercase the key', () => {
    const shortcut = { key: 's', ctrl: true, description: 'Save', action: () => {} };
    const formatted = formatShortcut(shortcut);
    
    expect(formatted).toContain('S');
    expect(formatted).not.toContain('+s');
  });

  it('should use ⌘ on Mac', () => {
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
      configurable: true,
    });

    const shortcut = { key: 's', ctrl: true, description: 'Save', action: () => {} };
    const formatted = formatShortcut(shortcut);
    
    expect(formatted).toContain('⌘');

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
  });
});
