import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Link as LinkIcon, Move, Type, Image as ImageIcon } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Canvas View Component
 * Infinite canvas for visual note organization
 */

export interface CanvasNode {
  id: string;
  type: 'text' | 'note' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  color?: string;
}

interface CanvasViewProps {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
  onNodesChange?: (nodes: CanvasNode[]) => void;
  onEdgesChange?: (edges: CanvasEdge[]) => void;
}

export default function CanvasView({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange,
  onEdgesChange,
}: CanvasViewProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);

  const handleAddNode = (type: CanvasNode['type']) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      x: -pan.x / zoom + 100,
      y: -pan.y / zoom + 100,
      width: type === 'text' ? 200 : 300,
      height: type === 'text' ? 100 : 200,
      content: type === 'text' ? 'New text node' : type === 'note' ? '# New Note' : '',
      color: '#4fc3f7',
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
    log.info('[CanvasView] Added node:', newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNode(null);
    
    onNodesChange?.(updatedNodes);
    onEdgesChange?.(updatedEdges);
    
    log.info('[CanvasView] Deleted node:', nodeId);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left click
    
    e.stopPropagation();
    setSelectedNode(nodeId);
    setDraggingNode(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX / zoom - node.x,
        y: e.clientY / zoom - node.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNode) {
      const node = nodes.find(n => n.id === draggingNode);
      if (node) {
        const newX = e.clientX / zoom - dragOffset.x;
        const newY = e.clientY / zoom - dragOffset.y;
        
        const updatedNodes = nodes.map(n =>
          n.id === draggingNode ? { ...n, x: newX, y: newY } : n
        );
        
        setNodes(updatedNodes);
      }
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, isPanning, nodes, dragOffset, zoom, pan, panStart]);

  const handleMouseUp = useCallback(() => {
    if (draggingNode) {
      onNodesChange?.(nodes);
    }
    setDraggingNode(null);
    setIsPanning(false);
  }, [draggingNode, nodes, onNodesChange]);

  useEffect(() => {
    if (draggingNode || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingNode, isPanning, handleMouseMove, handleMouseUp]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const handleNodeContentChange = (nodeId: string, content: string) => {
    const updatedNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, content } : n
    );
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border bg-secondary flex items-center gap-2">
        <button
          onClick={() => handleAddNode('text')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-background/80 rounded transition-colors"
          title="Add text node"
        >
          <Type size={16} />
          <span>Text</span>
        </button>
        
        <button
          onClick={() => handleAddNode('note')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-background/80 rounded transition-colors"
          title="Add note node"
        >
          <Plus size={16} />
          <span>Note</span>
        </button>
        
        <button
          onClick={() => handleAddNode('image')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-background/80 rounded transition-colors"
          title="Add image node"
        >
          <ImageIcon size={16} />
          <span>Image</span>
        </button>

        <div className="flex-1" />

        <div className="text-xs text-foreground/60">
          Zoom: {Math.round(zoom * 100)}%
        </div>

        <div className="text-xs text-foreground/60">
          {nodes.length} nodes
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative cursor-move"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Edges */}
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            {edges.map(edge => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;
              
              const x1 = fromNode.x + fromNode.width / 2;
              const y1 = fromNode.y + fromNode.height / 2;
              const x2 = toNode.x + toNode.width / 2;
              const y2 = toNode.y + toNode.height / 2;
              
              return (
                <line
                  key={edge.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.color || '#4fc3f7'}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#4fc3f7" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute bg-secondary border-2 rounded-lg shadow-lg cursor-move ${
                selectedNode === node.id ? 'border-primary' : 'border-border'
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              {/* Node header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  {node.type === 'text' && <Type size={14} />}
                  {node.type === 'note' && <Plus size={14} />}
                  {node.type === 'image' && <ImageIcon size={14} />}
                  <span className="text-xs font-semibold">{node.type}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  className="p-1 hover:bg-background rounded transition-colors"
                  title="Delete node"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Node content */}
              <div className="p-3 h-[calc(100%-40px)] overflow-auto">
                {node.type === 'text' && (
                  <textarea
                    value={node.content}
                    onChange={(e) => handleNodeContentChange(node.id, e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-sm"
                    placeholder="Enter text..."
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                
                {node.type === 'note' && (
                  <textarea
                    value={node.content}
                    onChange={(e) => handleNodeContentChange(node.id, e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-sm font-mono"
                    placeholder="# Enter markdown..."
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                
                {node.type === 'image' && (
                  <div className="w-full h-full flex items-center justify-center text-foreground/40">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-foreground/40">
            <p className="text-sm">Click the buttons above to add nodes</p>
            <p className="text-xs mt-1">Drag to move • Scroll to zoom • Click & drag canvas to pan</p>
          </div>
        </div>
      )}
    </div>
  );
}
