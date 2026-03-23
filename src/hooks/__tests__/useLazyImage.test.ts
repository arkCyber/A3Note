import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLazyImage } from '../useLazyImage';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  trigger(isIntersecting: boolean) {
    const entries = Array.from(this.elements).map(element => ({
      target: element,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }));
    this.callback(entries as IntersectionObserverEntry[], this as any);
  }
}

describe('useLazyImage', () => {
  let mockObserver: MockIntersectionObserver;

  beforeEach(() => {
    mockObserver = new MockIntersectionObserver(() => {});
    global.IntersectionObserver = vi.fn((callback) => {
      mockObserver = new MockIntersectionObserver(callback);
      return mockObserver as any;
    }) as any;

    // Mock Image
    global.Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      complete = false;

      addEventListener(event: string, handler: () => void) {
        if (event === 'load') this.onload = handler;
        if (event === 'error') this.onerror = handler;
      }

      removeEventListener() {}
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLazyImage('test.jpg'));

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isInView).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.ref.current).toBe(null);
  });

  it('should set isInView when element enters viewport', async () => {
    const { result } = renderHook(() => useLazyImage('test.jpg'));

    // Simulate element entering viewport
    mockObserver.trigger(true);

    await waitFor(() => {
      expect(result.current.isInView).toBe(true);
    });
  });

  it('should load image when in view', async () => {
    const { result } = renderHook(() => useLazyImage('test.jpg'));

    // Trigger intersection
    mockObserver.trigger(true);

    await waitFor(() => {
      expect(result.current.isInView).toBe(true);
    });

    // Simulate image load
    const img = new (global.Image as any)();
    img.src = 'test.jpg';
    if (img.onload) img.onload();

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it('should handle image load error', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => 
      useLazyImage('test.jpg', { onError })
    );

    mockObserver.trigger(true);

    await waitFor(() => {
      expect(result.current.isInView).toBe(true);
    });

    // Simulate image error
    const img = new (global.Image as any)();
    img.src = 'test.jpg';
    if (img.onerror) img.onerror();

    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should call onLoad callback when image loads', async () => {
    const onLoad = vi.fn();
    const { result } = renderHook(() => 
      useLazyImage('test.jpg', { onLoad })
    );

    mockObserver.trigger(true);

    await waitFor(() => {
      expect(result.current.isInView).toBe(true);
    });

    const img = new (global.Image as any)();
    img.src = 'test.jpg';
    if (img.onload) img.onload();

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('should use custom threshold and rootMargin', () => {
    const threshold = 0.5;
    const rootMargin = '100px';

    renderHook(() => 
      useLazyImage('test.jpg', { threshold, rootMargin })
    );

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold, rootMargin })
    );
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useLazyImage('test.jpg'));

    const disconnectSpy = vi.spyOn(mockObserver, 'disconnect');
    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle missing IntersectionObserver gracefully', async () => {
    // Remove IntersectionObserver
    const originalIO = global.IntersectionObserver;
    (global as any).IntersectionObserver = undefined;

    const { result } = renderHook(() => useLazyImage('test.jpg'));

    await waitFor(() => {
      expect(result.current.isInView).toBe(true);
    });

    // Restore
    global.IntersectionObserver = originalIO;
  });
});
