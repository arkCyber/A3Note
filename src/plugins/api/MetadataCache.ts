/**
 * MetadataCache API
 * Caches file metadata and links
 */

import { TFile } from './Vault';

export interface CachedMetadata {
  links?: LinkCache[];
  embeds?: EmbedCache[];
  tags?: TagCache[];
  headings?: HeadingCache[];
  sections?: SectionCache[];
  listItems?: ListItemCache[];
  frontmatter?: FrontMatterCache;
  blocks?: Record<string, BlockCache>;
}

export interface LinkCache {
  link: string;
  original: string;
  displayText?: string;
  position: Position;
}

export interface EmbedCache {
  link: string;
  original: string;
  displayText?: string;
  position: Position;
}

export interface TagCache {
  tag: string;
  position: Position;
}

export interface HeadingCache {
  heading: string;
  level: number;
  position: Position;
}

export interface SectionCache {
  type: string;
  position: Position;
}

export interface ListItemCache {
  position: Position;
  parent: number;
  task?: string;
}

export interface FrontMatterCache {
  [key: string]: any;
  position: Position;
}

export interface BlockCache {
  id: string;
  position: Position;
}

export interface Position {
  start: {
    line: number;
    col: number;
    offset: number;
  };
  end: {
    line: number;
    col: number;
    offset: number;
  };
}

export class MetadataCache {
  private cache: Map<string, CachedMetadata> = new Map();
  private resolvedLinks: Map<string, Record<string, number>> = new Map();
  
  /**
   * Get cached metadata for a file
   */
  getFileCache(file: TFile | string): CachedMetadata | null {
    const path = typeof file === 'string' ? file : file.path;
    return this.cache.get(path) || null;
  }
  
  /**
   * Get first link path in file
   */
  getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null {
    const resolvedPath = this.resolveLinkPath(linkpath, sourcePath);
    const name = resolvedPath.split('/').pop() || resolvedPath;

    return {
      path: resolvedPath,
      name,
      basename: name.replace(/\.md$/, ''),
      extension: 'md',
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0,
      },
    };
  }
  
  /**
   * Get all resolved links
   */
  getResolvedLinks(): Map<string, Record<string, number>> {
    return this.resolvedLinks;
  }
  
  /**
   * Get unresolved links
   */
  getUnresolvedLinks(): Map<string, Record<string, number>> {
    return new Map();
  }
  
  /**
   * Get all backlinks for a file
   */
  getBacklinksForFile(file: TFile): Map<string, LinkCache[]> {
    const backlinks = new Map<string, LinkCache[]>();
    
    // Iterate through all cached files
    this.cache.forEach((metadata, path) => {
      if (metadata.links) {
        const relevantLinks = metadata.links.filter(link => 
          this.resolveLinkPath(link.link, path) === file.path
        );
        
        if (relevantLinks.length > 0) {
          backlinks.set(path, relevantLinks);
        }
      }
    });
    
    return backlinks;
  }
  
  /**
   * Update cache for a file
   */
  updateCache(file: TFile, content: string): void {
    const metadata = this.parseMetadata(content);
    this.cache.set(file.path, metadata);
    this.updateResolvedLinks(file.path, metadata);
  }
  
  /**
   * Clear cache for a file
   */
  clearCache(file: TFile): void {
    this.cache.delete(file.path);
    this.resolvedLinks.delete(file.path);
  }
  
  /**
   * Parse metadata from content
   */
  private parseMetadata(content: string): CachedMetadata {
    const metadata: CachedMetadata = {
      links: [],
      embeds: [],
      tags: [],
      headings: [],
      sections: [],
    };
    
    const lines = content.split('\n');
    let offset = 0;
    
    lines.forEach((line, lineNum) => {
      // Parse headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        metadata.headings!.push({
          heading: headingMatch[2],
          level: headingMatch[1].length,
          position: {
            start: { line: lineNum, col: 0, offset },
            end: { line: lineNum, col: line.length, offset: offset + line.length },
          },
        });
      }
      
      // Parse links [[link]]
      const linkRegex = /\[\[([^\]]+)\]\]/g;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(line)) !== null) {
        const [original, link] = linkMatch;
        const col = linkMatch.index;
        
        metadata.links!.push({
          link,
          original,
          position: {
            start: { line: lineNum, col, offset: offset + col },
            end: { line: lineNum, col: col + original.length, offset: offset + col + original.length },
          },
        });
      }
      
      // Parse tags #tag
      const tagRegex = /#([a-zA-Z0-9_/-]+)/g;
      let tagMatch;
      while ((tagMatch = tagRegex.exec(line)) !== null) {
        const [tag] = tagMatch;
        const col = tagMatch.index;
        
        metadata.tags!.push({
          tag,
          position: {
            start: { line: lineNum, col, offset: offset + col },
            end: { line: lineNum, col: col + tag.length, offset: offset + col + tag.length },
          },
        });
      }
      
      offset += line.length + 1; // +1 for newline
    });
    
    return metadata;
  }
  
  /**
   * Update resolved links cache
   */
  private updateResolvedLinks(path: string, metadata: CachedMetadata): void {
    const links: Record<string, number> = {};
    
    if (metadata.links) {
      metadata.links.forEach(link => {
        const resolvedPath = this.resolveLinkPath(link.link, path);
        links[resolvedPath] = (links[resolvedPath] || 0) + 1;
      });
    }
    
    this.resolvedLinks.set(path, links);
  }
  
  /**
   * Resolve link path relative to source
   */
  private resolveLinkPath(link: string, sourcePath: string): string {
    // Remove .md extension if present in link
    const cleanLink = link.replace(/\.md$/, '');
    
    // Simple resolution - in reality this would be more complex
    if (link.startsWith('/')) {
      return link;
    }
    
    // For simple file names, resolve to same directory
    const sourceDir = sourcePath.split('/').slice(0, -1).join('/');
    const resolvedPath = sourceDir ? `${sourceDir}/${cleanLink}` : `/${cleanLink}`;
    
    // Normalize path and add .md extension
    return resolvedPath.replace(/\/+/g, '/') + '.md';
  }
  
  /**
   * Listen for cache changes
   */
  on(event: 'changed' | 'resolved', callback: (file: TFile) => void): void {
    window.addEventListener(`metadata-cache:${event}`, ((evt: Event) => {
      callback((evt as CustomEvent<TFile>).detail);
    }) as EventListener);
  }
  
  /**
   * Trigger cache event
   */
  trigger(event: 'changed' | 'resolved', file: TFile): void {
    const customEvent = new CustomEvent(`metadata-cache:${event}`, { detail: file });
    window.dispatchEvent(customEvent);
  }
}
