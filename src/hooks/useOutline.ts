/**
 * Outline Hook - Aerospace-grade integration
 * DO-178C Level A
 * React hook for outline functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { getOutlineService, OutlineItem } from '../services/OutlineService';

export interface UseOutlineOptions {
  content: string;
  currentLine?: number;
  onNavigate: (line: number) => void;
}

export function useOutline({ content, currentLine, onNavigate }: UseOutlineOptions) {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [currentHeading, setCurrentHeading] = useState<OutlineItem | null>(null);

  const service = getOutlineService();

  // Generate outline when content changes
  useEffect(() => {
    const newOutline = service.generateOutline(content, {
      maxDepth: 6,
      includeEmptyHeadings: false,
    });
    setOutline(newOutline);
  }, [content]);

  // Update current heading when line changes
  useEffect(() => {
    if (currentLine !== undefined && outline.length > 0) {
      const heading = service.findHeadingByLine(outline, currentLine);
      setCurrentHeading(heading);
    }
  }, [currentLine, outline]);

  // Navigate to heading
  const navigateToHeading = useCallback((headingId: string) => {
    const flat = service.flattenOutline(outline);
    const heading = flat.find(h => h.id === headingId);
    if (heading) {
      onNavigate(heading.line);
    }
  }, [outline, onNavigate]);

  // Navigate to next heading
  const nextHeading = useCallback(() => {
    if (currentHeading) {
      const next = service.getNextHeading(outline, currentHeading.id);
      if (next) {
        onNavigate(next.line);
      }
    }
  }, [currentHeading, outline, onNavigate]);

  // Navigate to previous heading
  const previousHeading = useCallback(() => {
    if (currentHeading) {
      const prev = service.getPreviousHeading(outline, currentHeading.id);
      if (prev) {
        onNavigate(prev.line);
      }
    }
  }, [currentHeading, outline, onNavigate]);

  // Generate table of contents
  const generateTOC = useCallback(() => {
    return service.generateTableOfContents(outline, { maxLevel: 4 });
  }, [outline]);

  // Get statistics
  const getStatistics = useCallback(() => {
    return service.getStatistics(outline);
  }, [outline]);

  return {
    outline,
    currentHeading,
    navigateToHeading,
    nextHeading,
    previousHeading,
    generateTOC,
    getStatistics,
  };
}
