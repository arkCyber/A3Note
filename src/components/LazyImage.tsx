import { useState } from 'react';
import { useLazyImage } from '../hooks/useLazyImage';
import { Loader, AlertCircle } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

interface LazyImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  enableZoom?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  enableZoom = true,
  threshold,
  rootMargin,
}: LazyImageProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const { ref, isLoaded, isInView, error } = useLazyImage(src, {
    threshold,
    rootMargin,
  });

  const style: React.CSSProperties = {};
  if (width) style.width = `${width}px`;
  if (height) style.height = `${height}px`;

  const handleClick = () => {
    if (enableZoom && isLoaded && !error) {
      setShowLightbox(true);
    }
  };

  return (
    <>
      <div
        className={`relative inline-block ${className}`}
        style={style}
      >
        {/* Placeholder */}
        {!isLoaded && !error && (
          <div
            className="absolute inset-0 bg-secondary flex items-center justify-center rounded"
            style={style}
          >
            {isInView ? (
              <Loader className="w-8 h-8 text-muted animate-spin" />
            ) : (
              <div className="w-8 h-8 text-muted">📷</div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="absolute inset-0 bg-error/10 border-2 border-error/50 flex flex-col items-center justify-center rounded p-4"
            style={style}
          >
            <AlertCircle className="w-8 h-8 text-error mb-2" />
            <p className="text-xs text-error text-center">
              Failed to load image
            </p>
            {alt && (
              <p className="text-xs text-muted text-center mt-1">
                {alt}
              </p>
            )}
          </div>
        )}

        {/* Actual Image */}
        <img
          ref={ref}
          src={isInView ? src : undefined}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${enableZoom && isLoaded ? 'cursor-zoom-in' : ''} ${className}`}
          style={style}
          onClick={handleClick}
          loading="lazy"
        />

        {/* Zoom Indicator */}
        {enableZoom && isLoaded && !error && (
          <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs">Click to zoom</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <ImageLightbox
          src={src}
          alt={alt}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}
