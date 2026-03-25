/**
 * Graph View Service - Aerospace-grade implementation
 * DO-178C Level A
 * Manages note relationship graph visualization
 */

export interface GraphNode {
  id: string;
  label: string;
  path: string;
  type: 'note' | 'tag' | 'folder';
  size?: number;
  color?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'link' | 'backlink' | 'tag' | 'embed';
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphViewOptions {
  maxNodes?: number;
  maxDepth?: number;
  includeOrphans?: boolean;
  includeTags?: boolean;
  linkTypes?: Array<'link' | 'backlink' | 'tag' | 'embed'>;
}

/**
 * Graph View Service
 * Provides note relationship graph generation and analysis
 */
export class GraphViewService {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  /**
   * Build graph from files
   */
  buildGraph(
    files: Array<{ path: string; content: string; name: string }>,
    options: GraphViewOptions = {}
  ): GraphData {
    const {
      maxNodes = 1000,
      includeOrphans = true,
      includeTags = true,
      linkTypes = ['link', 'backlink', 'tag', 'embed'],
    } = options;

    this.nodes.clear();
    this.edges = [];

    // Create nodes for all files
    for (const file of files) {
      this.addNode({
        id: file.path,
        label: file.name,
        path: file.path,
        type: 'note',
      });
    }

    // Extract links and create edges
    for (const file of files) {
      this.extractLinks(file, linkTypes, includeTags);
    }

    // Remove orphans if needed
    if (!includeOrphans) {
      this.removeOrphans();
    }

    // Limit nodes if needed
    if (this.nodes.size > maxNodes) {
      this.limitNodes(maxNodes);
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };
  }

  /**
   * Add a node
   */
  private addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  /**
   * Add an edge
   */
  private addEdge(edge: GraphEdge): void {
    // Check if edge already exists
    const exists = this.edges.some(
      e => e.source === edge.source && 
           e.target === edge.target && 
           e.type === edge.type
    );

    if (!exists) {
      this.edges.push(edge);
    }
  }

  /**
   * Extract links from file content
   */
  private extractLinks(
    file: { path: string; content: string },
    linkTypes: string[],
    includeTags: boolean
  ): void {
    const content = file.content;

    // Extract wikilinks [[link]]
    if (linkTypes.includes('link')) {
      const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
      let match;

      while ((match = wikilinkRegex.exec(content)) !== null) {
        const targetPath = this.resolveLink(match[1]);
        if (targetPath) {
          this.addEdge({
            source: file.path,
            target: targetPath,
            type: 'link',
            weight: 1,
          });
        }
      }
    }

    // Extract embeds ![[embed]]
    if (linkTypes.includes('embed')) {
      const embedRegex = /!\[\[([^\]]+)\]\]/g;
      let match;

      while ((match = embedRegex.exec(content)) !== null) {
        const targetPath = this.resolveLink(match[1]);
        if (targetPath) {
          this.addEdge({
            source: file.path,
            target: targetPath,
            type: 'embed',
            weight: 2,
          });
        }
      }
    }

    // Extract markdown links [text](url)
    if (linkTypes.includes('link')) {
      const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = mdLinkRegex.exec(content)) !== null) {
        const url = match[2];
        if (!url.startsWith('http') && !url.startsWith('#')) {
          const targetPath = this.resolveLink(url);
          if (targetPath) {
            this.addEdge({
              source: file.path,
              target: targetPath,
              type: 'link',
              weight: 1,
            });
          }
        }
      }
    }

    // Extract tags
    if (includeTags && linkTypes.includes('tag')) {
      const tagRegex = /#([a-zA-Z0-9_-]+)/g;
      let match;

      while ((match = tagRegex.exec(content)) !== null) {
        const tag = match[1];
        const tagId = `tag:${tag}`;

        // Add tag node
        this.addNode({
          id: tagId,
          label: `#${tag}`,
          path: tagId,
          type: 'tag',
        });

        // Add edge from file to tag
        this.addEdge({
          source: file.path,
          target: tagId,
          type: 'tag',
          weight: 1,
        });
      }
    }
  }

  /**
   * Resolve link to file path
   */
  private resolveLink(link: string): string | null {
    // Remove anchor
    link = link.split('#')[0];

    // Check if it's already a full path
    if (this.nodes.has(link)) {
      return link;
    }

    // Try to find matching file
    for (const [path, node] of this.nodes) {
      if (node.type === 'note') {
        const fileName = path.split('/').pop()?.replace(/\.md$/, '');
        if (fileName === link || fileName === link.replace(/\.md$/, '')) {
          return path;
        }
      }
    }

    return null;
  }

  /**
   * Remove orphan nodes (nodes with no edges)
   */
  private removeOrphans(): void {
    const connectedNodes = new Set<string>();

    for (const edge of this.edges) {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }

    for (const [id] of this.nodes) {
      if (!connectedNodes.has(id)) {
        this.nodes.delete(id);
      }
    }
  }

  /**
   * Limit nodes to most connected
   */
  private limitNodes(maxNodes: number): void {
    // Calculate node degrees
    const degrees = new Map<string, number>();

    for (const edge of this.edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }

    // Sort nodes by degree
    const sortedNodes = Array.from(this.nodes.entries())
      .sort((a, b) => (degrees.get(b[0]) || 0) - (degrees.get(a[0]) || 0))
      .slice(0, maxNodes);

    // Keep only top nodes
    const keepIds = new Set(sortedNodes.map(([id]) => id));
    
    for (const [id] of this.nodes) {
      if (!keepIds.has(id)) {
        this.nodes.delete(id);
      }
    }

    // Remove edges with deleted nodes
    this.edges = this.edges.filter(
      edge => keepIds.has(edge.source) && keepIds.has(edge.target)
    );
  }

  /**
   * Get node neighbors
   */
  getNeighbors(nodeId: string, depth: number = 1): GraphData {
    const nodes = new Set<string>([nodeId]);
    const edges: GraphEdge[] = [];

    let currentLevel = new Set([nodeId]);

    for (let d = 0; d < depth; d++) {
      const nextLevel = new Set<string>();

      for (const edge of this.edges) {
        if (currentLevel.has(edge.source)) {
          nodes.add(edge.target);
          nextLevel.add(edge.target);
          edges.push(edge);
        } else if (currentLevel.has(edge.target)) {
          nodes.add(edge.source);
          nextLevel.add(edge.source);
          edges.push(edge);
        }
      }

      currentLevel = nextLevel;
    }

    return {
      nodes: Array.from(nodes)
        .map(id => this.nodes.get(id))
        .filter((n): n is GraphNode => n !== undefined),
      edges,
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    noteCount: number;
    tagCount: number;
    averageDegree: number;
    maxDegree: number;
    orphanCount: number;
  } {
    const degrees = new Map<string, number>();

    for (const edge of this.edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }

    const degreeValues = Array.from(degrees.values());
    const averageDegree = degreeValues.length > 0
      ? degreeValues.reduce((a, b) => a + b, 0) / degreeValues.length
      : 0;
    const maxDegree = degreeValues.length > 0 ? Math.max(...degreeValues) : 0;

    const noteCount = Array.from(this.nodes.values()).filter(n => n.type === 'note').length;
    const tagCount = Array.from(this.nodes.values()).filter(n => n.type === 'tag').length;
    const orphanCount = Array.from(this.nodes.keys()).filter(id => !degrees.has(id)).length;

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
      noteCount,
      tagCount,
      averageDegree,
      maxDegree,
      orphanCount,
    };
  }

  /**
   * Find shortest path between two nodes
   */
  findShortestPath(sourceId: string, targetId: string): string[] | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }

    const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.id === targetId) {
        return current.path;
      }

      // Find neighbors
      for (const edge of this.edges) {
        let neighbor: string | null = null;

        if (edge.source === current.id) {
          neighbor = edge.target;
        } else if (edge.target === current.id) {
          neighbor = edge.source;
        }

        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            id: neighbor,
            path: [...current.path, neighbor],
          });
        }
      }
    }

    return null;
  }
}

// Singleton instance
let graphViewInstance: GraphViewService | null = null;

export function getGraphViewService(): GraphViewService {
  if (!graphViewInstance) {
    graphViewInstance = new GraphViewService();
  }
  return graphViewInstance;
}
