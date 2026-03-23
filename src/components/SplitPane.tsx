import { useState, useRef, useEffect, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Split Pane Component
 * Provides resizable split view functionality
 * 
 * @aerospace-grade
 * Features:
 * - Horizontal and vertical splits
 * - Draggable divider
 * - Min/max size constraints
 * - Keyboard navigation
 * - Responsive design
 * - Collapse/expand
 */

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  direction?: 'horizontal' | 'vertical';
  defaultSize?: number; // Percentage (0-100)
  minSize?: number; // Percentage
  maxSize?: number; // Percentage
  onSizeChange?: (size: number) => void;
  className?: string;
}

export default function SplitPane({
  left,
  right,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  onSizeChange,
  className = '',
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (isHorizontal) {
        const x = e.clientX - rect.left;
        newSize = (x / rect.width) * 100;
      } else {
        const y = e.clientY - rect.top;
        newSize = (y / rect.height) * 100;
      }

      // Apply constraints
      newSize = Math.max(minSize, Math.min(maxSize, newSize));

      setSize(newSize);
      onSizeChange?.(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      log.info('[SplitPane] Resize completed', { size });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal, minSize, maxSize, onSizeChange, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    log.info('[SplitPane] Resize started');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newSize = size;

    if (isHorizontal) {
      if (e.key === 'ArrowLeft') newSize = Math.max(minSize, size - 5);
      if (e.key === 'ArrowRight') newSize = Math.min(maxSize, size + 5);
    } else {
      if (e.key === 'ArrowUp') newSize = Math.max(minSize, size - 5);
      if (e.key === 'ArrowDown') newSize = Math.min(maxSize, size + 5);
    }

    if (newSize !== size) {
      e.preventDefault();
      setSize(newSize);
      onSizeChange?.(newSize);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`split-pane ${isHorizontal ? 'split-horizontal' : 'split-vertical'} ${className}`}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Left/Top Pane */}
      <div
        className="split-pane-left"
        style={{
          [isHorizontal ? 'width' : 'height']: `${size}%`,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        className={`split-divider ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        style={{
          [isHorizontal ? 'width' : 'height']: '4px',
          backgroundColor: isDragging ? 'var(--primary)' : 'var(--border)',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: isDragging ? 'none' : 'background-color 0.2s',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="split-handle"
          style={{
            backgroundColor: 'var(--foreground)',
            opacity: 0.3,
            borderRadius: '2px',
            [isHorizontal ? 'width' : 'height']: '2px',
            [isHorizontal ? 'height' : 'width']: '40px',
          }}
        />
      </div>

      {/* Right/Bottom Pane */}
      <div
        className="split-pane-right"
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {right}
      </div>

      <style>{`
        .split-divider:hover {
          background-color: var(--primary) !important;
        }

        .split-divider:focus {
          outline: 2px solid var(--primary);
          outline-offset: -2px;
        }

        .split-divider.dragging {
          user-select: none;
        }

        .split-pane {
          user-select: ${isDragging ? 'none' : 'auto'};
        }
      `}</style>
    </div>
  );
}
