import { useEffect, useCallback, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { log } from '../utils/logger';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    log.info('ImageLightbox', `Opened lightbox for: ${src}`);
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [src, onClose]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      log.info('ImageLightbox', 'Image downloaded');
    } catch (error) {
      log.error('ImageLightbox', 'Download failed:', error as Error);
    }
  }, [src, alt]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-lg p-2 backdrop-blur-sm">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <span className="text-white text-sm min-w-[4rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <div className="w-px h-6 bg-white/20" />
        <button
          onClick={(e) => { e.stopPropagation(); handleRotate(); }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Rotate"
        >
          <RotateCw className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <div className="w-px h-6 bg-white/20" />
        <button
          onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="p-2 hover:bg-white/10 rounded transition-colors text-white text-sm"
          title="Reset"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Image Info */}
      {alt && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p className="text-white text-sm">{alt}</p>
        </div>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain select-none"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm">
        <p className="text-white/70 text-xs">
          Scroll to zoom • Drag to pan • ESC to close
        </p>
      </div>
    </div>
  );
}
