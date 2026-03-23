import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SplitPane from '../SplitPane';

describe('SplitPane', () => {
  it('should render left and right panes', () => {
    render(
      <SplitPane
        left={<div>Left Content</div>}
        right={<div>Right Content</div>}
      />
    );

    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('should render horizontal split by default', () => {
    const { container } = render(
      <SplitPane
        left={<div>Left</div>}
        right={<div>Right</div>}
      />
    );

    const splitPane = container.querySelector('.split-horizontal');
    expect(splitPane).toBeInTheDocument();
  });

  it('should render vertical split when specified', () => {
    const { container } = render(
      <SplitPane
        left={<div>Top</div>}
        right={<div>Bottom</div>}
        direction="vertical"
      />
    );

    const splitPane = container.querySelector('.split-vertical');
    expect(splitPane).toBeInTheDocument();
  });

  it('should apply default size', () => {
    const { container } = render(
      <SplitPane
        left={<div>Left</div>}
        right={<div>Right</div>}
        defaultSize={60}
      />
    );

    const leftPane = container.querySelector('.split-pane-left') as HTMLElement;
    expect(leftPane.style.width).toBe('60%');
  });

  it('should call onSizeChange when resizing', () => {
    const onSizeChange = vi.fn();
    
    const { container } = render(
      <SplitPane
        left={<div>Left</div>}
        right={<div>Right</div>}
        onSizeChange={onSizeChange}
      />
    );

    const divider = container.querySelector('.split-divider') as HTMLElement;
    
    fireEvent.mouseDown(divider);
    fireEvent.mouseMove(document, { clientX: 300 });
    fireEvent.mouseUp(document);

    expect(onSizeChange).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const onSizeChange = vi.fn();
    
    const { container } = render(
      <SplitPane
        left={<div>Left</div>}
        right={<div>Right</div>}
        onSizeChange={onSizeChange}
      />
    );

    const divider = container.querySelector('.split-divider') as HTMLElement;
    
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    
    expect(onSizeChange).toHaveBeenCalled();
  });

  it('should respect min and max size constraints', () => {
    const { container } = render(
      <SplitPane
        left={<div>Left</div>}
        right={<div>Right</div>}
        minSize={20}
        maxSize={80}
      />
    );

    const divider = container.querySelector('.split-divider') as HTMLElement;
    expect(divider).toHaveAttribute('aria-valuemin', '20');
    expect(divider).toHaveAttribute('aria-valuemax', '80');
  });
});
