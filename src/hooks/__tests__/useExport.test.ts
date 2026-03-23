import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '../useExport';

describe('useExport', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportProgress).toBe(0);
    expect(result.current.exportError).toBeNull();
  });

  it('should have export functions', () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.exportAsPDF).toBeDefined();
    expect(result.current.exportAsHTML).toBeDefined();
    expect(result.current.exportAsMarkdown).toBeDefined();
  });

  it('should reset error', () => {
    const { result } = renderHook(() => useExport());

    act(() => {
      result.current.resetError();
    });

    expect(result.current.exportError).toBeNull();
  });
});
