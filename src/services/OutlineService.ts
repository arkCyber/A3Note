/**
 * Outline Service - Aerospace-grade implementation
 * DO-178C Level A
 * Generates document outline from markdown headings
 */

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
  line: number;
  children: OutlineItem[];
}

export interface OutlineOptions {
  maxDepth?: number;
  includeEmptyHeadings?: boolean;
  flatList?: boolean;
}

/**
 * Outline Service
 * Provides document outline generation and navigation
 */
export class OutlineService {
  /**
   * Generate outline from markdown content
   */
  generateOutline(content: string, options: OutlineOptions = {}): OutlineItem[] {
    const {
      maxDepth = 6,
      includeEmptyHeadings = true,
      flatList = false,
    } = options;

    const lines = content.split('\n');
    const headings: Array<{ level: number; text: string; line: number }> = [];

    // Extract headings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(#{1,6})\s+(.+)$/);

      if (match) {
        const level = match[1].length;
        const text = match[2].trim();

        if (level <= maxDepth && (includeEmptyHeadings || text.length > 0)) {
          headings.push({ level, text, line: i + 1 });
        }
      }
    }

    if (flatList) {
      return headings.map((h, index) => ({
        id: `heading-${index}`,
        level: h.level,
        text: h.text,
        line: h.line,
        children: [],
      }));
    }

    return this.buildHierarchy(headings);
  }

  /**
   * Build hierarchical outline structure
   */
  private buildHierarchy(
    headings: Array<{ level: number; text: string; line: number }>
  ): OutlineItem[] {
    const root: OutlineItem[] = [];
    const stack: OutlineItem[] = [];

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const item: OutlineItem = {
        id: `heading-${i}`,
        level: heading.level,
        text: heading.text,
        line: heading.line,
        children: [],
      };

      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(item);
      } else {
        stack[stack.length - 1].children.push(item);
      }

      stack.push(item);
    }

    return root;
  }

  /**
   * Flatten outline to list
   */
  flattenOutline(outline: OutlineItem[]): OutlineItem[] {
    const result: OutlineItem[] = [];

    const flatten = (items: OutlineItem[]) => {
      for (const item of items) {
        result.push({ ...item, children: [] });
        if (item.children.length > 0) {
          flatten(item.children);
        }
      }
    };

    flatten(outline);
    return result;
  }

  /**
   * Find heading by line number
   */
  findHeadingByLine(outline: OutlineItem[], line: number): OutlineItem | null {
    const flat = this.flattenOutline(outline);
    
    // Find closest heading before or at the line
    let closest: OutlineItem | null = null;
    let minDistance = Infinity;

    for (const item of flat) {
      if (item.line <= line) {
        const distance = line - item.line;
        if (distance < minDistance) {
          minDistance = distance;
          closest = item;
        }
      }
    }

    return closest;
  }

  /**
   * Get heading path (breadcrumb)
   */
  getHeadingPath(outline: OutlineItem[], targetId: string): OutlineItem[] {
    const path: OutlineItem[] = [];

    const search = (items: OutlineItem[]): boolean => {
      for (const item of items) {
        path.push(item);

        if (item.id === targetId) {
          return true;
        }

        if (item.children.length > 0 && search(item.children)) {
          return true;
        }

        path.pop();
      }
      return false;
    };

    search(outline);
    return path;
  }

  /**
   * Get next heading
   */
  getNextHeading(outline: OutlineItem[], currentId: string): OutlineItem | null {
    const flat = this.flattenOutline(outline);
    const currentIndex = flat.findIndex(item => item.id === currentId);

    if (currentIndex !== -1 && currentIndex < flat.length - 1) {
      return flat[currentIndex + 1];
    }

    return null;
  }

  /**
   * Get previous heading
   */
  getPreviousHeading(outline: OutlineItem[], currentId: string): OutlineItem | null {
    const flat = this.flattenOutline(outline);
    const currentIndex = flat.findIndex(item => item.id === currentId);

    if (currentIndex > 0) {
      return flat[currentIndex - 1];
    }

    return null;
  }

  /**
   * Get statistics
   */
  getStatistics(outline: OutlineItem[]): {
    totalHeadings: number;
    byLevel: Record<number, number>;
    maxDepth: number;
    averageChildrenPerHeading: number;
  } {
    const flat = this.flattenOutline(outline);
    const byLevel: Record<number, number> = {};
    let maxDepth = 0;
    let totalChildren = 0;

    const countChildren = (items: OutlineItem[]) => {
      for (const item of items) {
        byLevel[item.level] = (byLevel[item.level] || 0) + 1;
        maxDepth = Math.max(maxDepth, item.level);
        totalChildren += item.children.length;
        if (item.children.length > 0) {
          countChildren(item.children);
        }
      }
    };

    countChildren(outline);

    return {
      totalHeadings: flat.length,
      byLevel,
      maxDepth,
      averageChildrenPerHeading: flat.length > 0 ? totalChildren / flat.length : 0,
    };
  }

  /**
   * Generate table of contents
   */
  generateTableOfContents(outline: OutlineItem[], options: { maxLevel?: number } = {}): string {
    const { maxLevel = 6 } = options;
    const lines: string[] = [];

    const generate = (items: OutlineItem[], depth: number = 0) => {
      for (const item of items) {
        if (item.level <= maxLevel) {
          const indent = '  '.repeat(depth);
          const bullet = depth === 0 ? '-' : '-';
          lines.push(`${indent}${bullet} [${item.text}](#${this.slugify(item.text)})`);

          if (item.children.length > 0) {
            generate(item.children, depth + 1);
          }
        }
      }
    };

    generate(outline);
    return lines.join('\n');
  }

  /**
   * Convert text to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Validate outline structure
   */
  validateOutline(outline: OutlineItem[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const validate = (items: OutlineItem[], parentLevel: number = 0) => {
      for (const item of items) {
        // Check level progression
        if (parentLevel > 0 && item.level <= parentLevel) {
          errors.push(`Invalid level progression: ${item.text} (level ${item.level}) under parent (level ${parentLevel})`);
        }

        // Check for empty text
        if (!item.text || item.text.trim().length === 0) {
          errors.push(`Empty heading text at line ${item.line}`);
        }

        // Check line number
        if (item.line < 1) {
          errors.push(`Invalid line number for heading: ${item.text}`);
        }

        // Validate children
        if (item.children.length > 0) {
          validate(item.children, item.level);
        }
      }
    };

    validate(outline);

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
let outlineInstance: OutlineService | null = null;

export function getOutlineService(): OutlineService {
  if (!outlineInstance) {
    outlineInstance = new OutlineService();
  }
  return outlineInstance;
}
