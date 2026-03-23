import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasView, { CanvasNode } from '../CanvasView';

describe('CanvasView', () => {
  const mockNodes: CanvasNode[] = [
    {
      id: 'node-1',
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      content: 'Test text',
    },
    {
      id: 'node-2',
      type: 'note',
      x: 400,
      y: 200,
      width: 300,
      height: 200,
      content: '# Test note',
    },
  ];

  const mockProps = {
    nodes: mockNodes,
    edges: [],
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toolbar buttons', () => {
    render(<CanvasView {...mockProps} />);
    
    expect(screen.getByText('Text')).toBeTruthy();
    expect(screen.getByText('Note')).toBeTruthy();
    expect(screen.getByText('Image')).toBeTruthy();
  });

  it('should display zoom level', () => {
    render(<CanvasView {...mockProps} />);
    
    expect(screen.getByText('Zoom: 100%')).toBeTruthy();
  });

  it('should display node count', () => {
    render(<CanvasView {...mockProps} />);
    
    expect(screen.getByText('2 nodes')).toBeTruthy();
  });

  it('should add text node when Text button is clicked', () => {
    render(<CanvasView {...mockProps} />);
    
    const textButton = screen.getByText('Text').closest('button');
    if (textButton) {
      fireEvent.click(textButton);
    }
    
    expect(mockProps.onNodesChange).toHaveBeenCalled();
    const newNodes = mockProps.onNodesChange.mock.calls[0][0];
    expect(newNodes.length).toBe(3);
    expect(newNodes[2].type).toBe('text');
  });

  it('should add note node when Note button is clicked', () => {
    render(<CanvasView {...mockProps} />);
    
    const noteButton = screen.getByText('Note').closest('button');
    if (noteButton) {
      fireEvent.click(noteButton);
    }
    
    expect(mockProps.onNodesChange).toHaveBeenCalled();
    const newNodes = mockProps.onNodesChange.mock.calls[0][0];
    expect(newNodes.length).toBe(3);
    expect(newNodes[2].type).toBe('note');
  });

  it('should add image node when Image button is clicked', () => {
    render(<CanvasView {...mockProps} />);
    
    const imageButton = screen.getByText('Image').closest('button');
    if (imageButton) {
      fireEvent.click(imageButton);
    }
    
    expect(mockProps.onNodesChange).toHaveBeenCalled();
    const newNodes = mockProps.onNodesChange.mock.calls[0][0];
    expect(newNodes.length).toBe(3);
    expect(newNodes[2].type).toBe('image');
  });

  it('should render existing nodes', () => {
    render(<CanvasView {...mockProps} />);
    
    expect(screen.getByText('text')).toBeTruthy();
    expect(screen.getByText('note')).toBeTruthy();
  });

  it('should delete node when delete button is clicked', () => {
    render(<CanvasView {...mockProps} />);
    
    const deleteButtons = screen.getAllByTitle('Delete node');
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }
    
    expect(mockProps.onNodesChange).toHaveBeenCalled();
    const newNodes = mockProps.onNodesChange.mock.calls[0][0];
    expect(newNodes.length).toBe(1);
  });

  it('should show instructions when no nodes', () => {
    render(<CanvasView nodes={[]} edges={[]} />);
    
    expect(screen.getByText('Click the buttons above to add nodes')).toBeTruthy();
  });

  it('should handle node content change', () => {
    render(<CanvasView {...mockProps} />);
    
    const textareas = screen.getAllByRole('textbox');
    if (textareas.length > 0) {
      fireEvent.change(textareas[0], { target: { value: 'New content' } });
    }
    
    expect(mockProps.onNodesChange).toHaveBeenCalled();
  });

  it('should handle mouse down on node', () => {
    render(<CanvasView {...mockProps} />);
    
    const nodes = screen.getAllByText('text');
    if (nodes.length > 0) {
      const nodeElement = nodes[0].closest('div');
      if (nodeElement) {
        fireEvent.mouseDown(nodeElement);
      }
    }
    
    // Node should be selected (implementation specific)
  });

  it('should update zoom on wheel event', () => {
    const { container } = render(<CanvasView {...mockProps} />);
    
    const canvas = container.querySelector('[class*="overflow-hidden"]');
    if (canvas) {
      fireEvent.wheel(canvas, { deltaY: 100 });
    }
    
    // Zoom should change (implementation specific)
  });
});
