import { useEffect, useRef, useState } from 'react';
import { log } from '../utils/logger';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseLazyImageReturn {
  ref: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  isInView: boolean;
  error: Error | null;
}

export function useLazyImage(
  src: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn {
  const {
    threshold = 0.01,
    rootMargin = '50px',
    onLoad,
    onError,
  } = options;

  const ref = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      log.warn('useLazyImage', 'IntersectionObserver not supported, loading image immediately');
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            log.debug('useLazyImage', `Image entered viewport: ${src}`);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold, rootMargin]);

  useEffect(() => {
    if (!isInView || isLoaded) return;

    const element = ref.current;
    if (!element) return;

    const img = new Image();
    
    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
      log.info('useLazyImage', `Image loaded: ${src}`);
      onLoad?.();
    };

    const handleError = () => {
      const err = new Error(`Failed to load image: ${src}`);
      setError(err);
      log.error('useLazyImage', 'Image load failed:', err);
      onError?.(err);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    img.src = src;

    // If image is already cached, it might load synchronously
    if (img.complete) {
      handleLoad();
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isInView, isLoaded, src, onLoad, onError]);

  return {
    ref,
    isLoaded,
    isInView,
    error,
  };
}

export default useLazyImage;
