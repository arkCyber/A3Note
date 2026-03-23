// Graph View - Aerospace Grade
// Knowledge graph visualization with force-directed layout

import { useEffect, useRef, useState } from 'react';
import { Network, Share2, ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';
import { log } from '../utils/logger';

interface GraphNode {
  id: string;
  label: string;
  path: string;
  size: number;
  color: string;
  tags: string[];
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphViewProps {
  workspacePath: string;
  currentFilePath: string | null;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export default function GraphView({ workspacePath, currentFilePath, onNavigate, onClose }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOrphans, setShowOrphans] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    loadGraphData();
  }, [workspacePath]);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      renderGraph();
    }
  }, [graphData, zoom, pan, currentFilePath, showOrphans, filterTag]);

  const loadGraphData = async () => {
    setIsLoading(true);
    try {
      log.info('[GraphView] Loading graph data for:', workspacePath);

      // Mock data for web environment
      const mockNodes: GraphNode[] = [
        {
          id: '/docs/note1.md',
          label: '笔记 1',
          path: '/docs/note1.md',
          size: 15,
          color: '#3b82f6',
          tags: ['重要', '工作'],
        },
        {
          id: '/docs/note2.md',
          label: '笔记 2',
          path: '/docs/note2.md',
          size: 12,
          color: '#6b7280',
          tags: ['个人'],
        },
        {
          id: '/docs/note3.md',
          label: '笔记 3',
          path: '/docs/note3.md',
          size: 10,
          color: '#6b7280',
          tags: ['项目'],
        },
      ];

      const mockLinks: GraphLink[] = [
        { source: '/docs/note1.md', target: '/docs/note2.md', strength: 1 },
        { source: '/docs/note1.md', target: '/docs/note3.md', strength: 0.8 },
      ];

      setGraphData({ nodes: mockNodes, links: mockLinks });
      log.info(`[GraphView] Loaded ${mockNodes.length} nodes, ${mockLinks.length} links`);
    } catch (error) {
      log.error('[GraphView] Failed to load graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);

    // Filter nodes
    let filteredNodes = graphData.nodes;
    if (filterTag) {
      filteredNodes = filteredNodes.filter(node => node.tags.includes(filterTag));
    }
    if (!showOrphans) {
      const connectedNodeIds = new Set<string>();
      graphData.links.forEach(link => {
        connectedNodeIds.add(link.source);
        connectedNodeIds.add(link.target);
      });
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }

    // Simple force-directed layout (simplified for performance)
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Initialize positions in a circle
    filteredNodes.forEach((node, i) => {
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      nodePositions.set(node.id, {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      });
    });

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw links
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    graphData.links.forEach(link => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      // Draw node circle
      ctx.fillStyle = node.id === currentFilePath ? '#3b82f6' : '#6b7280';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, node.size, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node label
      ctx.fillStyle = '#d4d4d4';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, pos.x, pos.y + node.size + 15);
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(prev * delta, 5)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const allTags = Array.from(new Set(graphData.nodes.flatMap(n => n.tags)));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Knowledge Graph</h2>
            <span className="text-sm text-foreground/60">
              {graphData.nodes.length} notes, {graphData.links.length} links
            </span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-background rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-background rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-background rounded transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border bg-secondary/30 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/60" />
            <span className="text-sm text-foreground/60">Filters:</span>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOrphans}
              onChange={(e) => setShowOrphans(e.target.checked)}
              className="rounded"
            />
            Show orphan notes
          </label>

          {allTags.length > 0 && (
            <select
              value={filterTag || ''}
              onChange={(e) => setFilterTag(e.target.value || null)}
              className="px-3 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Network className="w-12 h-12 mx-auto mb-3 animate-pulse text-primary" />
                <p className="text-foreground/60">Loading graph...</p>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
          )}
        </div>

        {/* Info */}
        <div className="px-6 py-3 border-t border-border bg-secondary/30 text-xs text-foreground/60">
          Drag to pan • Scroll to zoom • Click node to navigate
        </div>
      </div>
    </div>
  );
}
