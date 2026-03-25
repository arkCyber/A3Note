/**
 * Metadata Extractor
 * Aerospace-grade metadata extraction from markdown files
 * Combines frontmatter, inline fields, links, tags, headings, etc.
 */

import { FrontmatterParser, FrontmatterData } from './frontmatter-parser';
import { InlineFieldParser, InlineField } from './inline-field-parser';
import { log } from '../../utils/logger';

export interface FileMetadata {
  path: string;
  frontmatter: FrontmatterData | null;
  inlineFields: Record<string, string[]>;
  links: LinkMetadata[];
  embeds: EmbedMetadata[];
  tags: TagMetadata[];
  headings: HeadingMetadata[];
  blocks: BlockMetadata[];
  sections: SectionMetadata[];
  listItems: ListItemMetadata[];
  codeBlocks: CodeBlockMetadata[];
  stats: FileStats;
  timestamp: number;
}

export interface LinkMetadata {
  target: string;
  displayText?: string;
  position: Position;
  isEmbed: boolean;
  heading?: string;
  blockId?: string;
}

export interface EmbedMetadata {
  target: string;
  position: Position;
  heading?: string;
  blockId?: string;
}

export interface TagMetadata {
  tag: string;
  position: Position;
}

export interface HeadingMetadata {
  level: number;
  text: string;
  position: Position;
}

export interface BlockMetadata {
  id: string;
  position: Position;
  content: string;
}

export interface SectionMetadata {
  type: string;
  position: Position;
}

export interface ListItemMetadata {
  position: Position;
  parent: number;
  task?: boolean;
  checked?: boolean;
}

export interface CodeBlockMetadata {
  language?: string;
  position: Position;
  content: string;
}

export interface Position {
  start: { line: number; col: number; offset: number };
  end: { line: number; col: number; offset: number };
}

export interface FileStats {
  size: number;
  lines: number;
  words: number;
  characters: number;
  links: number;
  embeds: number;
  tags: number;
  headings: number;
}

/**
 * Metadata Extractor
 */
export class MetadataExtractor {
  /**
   * Extract all metadata from file content
   */
  static extract(content: string, filePath: string): FileMetadata {
    const startTime = Date.now();

    try {
      // Parse frontmatter
      const frontmatter = this.extractFrontmatter(content);

      // Parse inline fields
      const inlineFields = this.extractInlineFields(content);

      // Extract links and embeds
      const { links, embeds } = this.extractLinksAndEmbeds(content);

      // Extract tags
      const tags = this.extractTags(content);

      // Extract headings
      const headings = this.extractHeadings(content);

      // Extract blocks
      const blocks = this.extractBlocks(content);

      // Extract sections
      const sections = this.extractSections(content);

      // Extract list items
      const listItems = this.extractListItems(content);

      // Extract code blocks
      const codeBlocks = this.extractCodeBlocks(content);

      // Calculate stats
      const stats = this.calculateStats(content, links, embeds, tags, headings);

      const metadata: FileMetadata = {
        path: filePath,
        frontmatter,
        inlineFields,
        links,
        embeds,
        tags,
        headings,
        blocks,
        sections,
        listItems,
        codeBlocks,
        stats,
        timestamp: Date.now(),
      };

      const duration = Date.now() - startTime;
      log.debug('MetadataExtractor', `Extracted metadata for ${filePath} in ${duration}ms`);

      return metadata;
    } catch (error) {
      log.error('MetadataExtractor', `Failed to extract metadata for ${filePath}`, error as Error);
      
      // Return minimal metadata on error
      return {
        path: filePath,
        frontmatter: null,
        inlineFields: {},
        links: [],
        embeds: [],
        tags: [],
        headings: [],
        blocks: [],
        sections: [],
        listItems: [],
        codeBlocks: [],
        stats: this.calculateStats(content, [], [], [], []),
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Extract frontmatter
   */
  private static extractFrontmatter(content: string): FrontmatterData | null {
    const parsed = FrontmatterParser.parse(content);
    return parsed ? parsed.data : null;
  }

  /**
   * Extract inline fields
   */
  private static extractInlineFields(content: string): Record<string, string[]> {
    return InlineFieldParser.extractFields(content);
  }

  /**
   * Extract links and embeds
   */
  private static extractLinksAndEmbeds(content: string): {
    links: LinkMetadata[];
    embeds: EmbedMetadata[];
  } {
    const links: LinkMetadata[] = [];
    const embeds: EmbedMetadata[] = [];
    const lines = content.split('\n');

    // Pattern for [[link]] and ![[embed]]
    const linkPattern = /(!?)\[\[([^\]]+)\]\]/g;

    let lineOffset = 0;
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match: RegExpExecArray | null;

      // Reset regex
      linkPattern.lastIndex = 0;

      while ((match = linkPattern.exec(line)) !== null) {
        const isEmbed = match[1] === '!';
        const linkText = match[2];

        // Parse link components
        const { target, displayText, heading, blockId } = this.parseLinkText(linkText);

        const position: Position = {
          start: {
            line: lineNum,
            col: match.index,
            offset: lineOffset + match.index,
          },
          end: {
            line: lineNum,
            col: match.index + match[0].length,
            offset: lineOffset + match.index + match[0].length,
          },
        };

        if (isEmbed) {
          embeds.push({
            target,
            position,
            heading,
            blockId,
          });
        }

        links.push({
          target,
          displayText,
          position,
          isEmbed,
          heading,
          blockId,
        });
      }

      lineOffset += line.length + 1; // +1 for newline
    }

    return { links, embeds };
  }

  /**
   * Parse link text into components
   */
  private static parseLinkText(linkText: string): {
    target: string;
    displayText?: string;
    heading?: string;
    blockId?: string;
  } {
    // Check for display text: [[target|display]]
    const pipeIndex = linkText.indexOf('|');
    let target = linkText;
    let displayText: string | undefined;

    if (pipeIndex > 0) {
      target = linkText.substring(0, pipeIndex).trim();
      displayText = linkText.substring(pipeIndex + 1).trim();
    }

    // Check for heading or block reference
    let heading: string | undefined;
    let blockId: string | undefined;

    const hashIndex = target.indexOf('#');
    if (hashIndex > 0) {
      const reference = target.substring(hashIndex + 1);
      target = target.substring(0, hashIndex);

      if (reference.startsWith('^')) {
        blockId = reference.substring(1);
      } else {
        heading = reference;
      }
    }

    return { target, displayText, heading, blockId };
  }

  /**
   * Extract tags
   */
  private static extractTags(content: string): TagMetadata[] {
    const tags: TagMetadata[] = [];
    const lines = content.split('\n');
    
    // Pattern for #tag
    const tagPattern = /#([a-zA-Z0-9_/-]+)/g;

    let lineOffset = 0;
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match: RegExpExecArray | null;

      // Reset regex
      tagPattern.lastIndex = 0;

      while ((match = tagPattern.exec(line)) !== null) {
        const tag = match[1];

        tags.push({
          tag: `#${tag}`,
          position: {
            start: {
              line: lineNum,
              col: match.index,
              offset: lineOffset + match.index,
            },
            end: {
              line: lineNum,
              col: match.index + match[0].length,
              offset: lineOffset + match.index + match[0].length,
            },
          },
        });
      }

      lineOffset += line.length + 1;
    }

    return tags;
  }

  /**
   * Extract headings
   */
  private static extractHeadings(content: string): HeadingMetadata[] {
    const headings: HeadingMetadata[] = [];
    const lines = content.split('\n');

    let lineOffset = 0;
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const trimmed = line.trim();

      // ATX headings: # Heading
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();

        headings.push({
          level,
          text,
          position: {
            start: {
              line: lineNum,
              col: 0,
              offset: lineOffset,
            },
            end: {
              line: lineNum,
              col: line.length,
              offset: lineOffset + line.length,
            },
          },
        });
      }

      lineOffset += line.length + 1;
    }

    return headings;
  }

  /**
   * Extract blocks with IDs
   */
  private static extractBlocks(content: string): BlockMetadata[] {
    const blocks: BlockMetadata[] = [];
    const lines = content.split('\n');

    let lineOffset = 0;
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Pattern for ^block-id at end of line
      const match = line.match(/\s+\^([\w-]+)\s*$/);
      if (match) {
        const blockId = match[1];
        const content = line.substring(0, match.index).trim();

        blocks.push({
          id: blockId,
          content,
          position: {
            start: {
              line: lineNum,
              col: 0,
              offset: lineOffset,
            },
            end: {
              line: lineNum,
              col: line.length,
              offset: lineOffset + line.length,
            },
          },
        });
      }

      lineOffset += line.length + 1;
    }

    return blocks;
  }

  /**
   * Extract sections
   */
  private static extractSections(content: string): SectionMetadata[] {
    const sections: SectionMetadata[] = [];
    const lines = content.split('\n');

    let lineOffset = 0;
    let inCodeBlock = false;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const trimmed = line.trim();

      // Track code blocks
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }

      if (!inCodeBlock) {
        let type: string | null = null;

        if (trimmed.startsWith('#')) {
          type = 'heading';
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('+')) {
          type = 'list';
        } else if (trimmed.startsWith('>')) {
          type = 'blockquote';
        } else if (trimmed.match(/^\d+\./)) {
          type = 'ordered-list';
        }

        if (type) {
          sections.push({
            type,
            position: {
              start: {
                line: lineNum,
                col: 0,
                offset: lineOffset,
              },
              end: {
                line: lineNum,
                col: line.length,
                offset: lineOffset + line.length,
              },
            },
          });
        }
      }

      lineOffset += line.length + 1;
    }

    return sections;
  }

  /**
   * Extract list items
   */
  private static extractListItems(content: string): ListItemMetadata[] {
    const items: ListItemMetadata[] = [];
    const lines = content.split('\n');

    let lineOffset = 0;
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const trimmed = line.trim();

      // Check for list item
      const match = trimmed.match(/^[-*+]\s+(\[[ xX]\]\s+)?/);
      if (match) {
        const indent = line.length - line.trimStart().length;
        const parent = Math.floor(indent / 2);
        
        let task = false;
        let checked = false;

        if (match[1]) {
          task = true;
          checked = match[1].toLowerCase().includes('x');
        }

        items.push({
          position: {
            start: {
              line: lineNum,
              col: 0,
              offset: lineOffset,
            },
            end: {
              line: lineNum,
              col: line.length,
              offset: lineOffset + line.length,
            },
          },
          parent,
          task,
          checked,
        });
      }

      lineOffset += line.length + 1;
    }

    return items;
  }

  /**
   * Extract code blocks
   */
  private static extractCodeBlocks(content: string): CodeBlockMetadata[] {
    const blocks: CodeBlockMetadata[] = [];
    const lines = content.split('\n');

    let lineOffset = 0;
    let inCodeBlock = false;
    let codeBlockStart = 0;
    let codeBlockLanguage: string | undefined;
    let codeBlockContent: string[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          // Start of code block
          inCodeBlock = true;
          codeBlockStart = lineOffset;
          codeBlockLanguage = trimmed.substring(3).trim() || undefined;
          codeBlockContent = [];
        } else {
          // End of code block
          blocks.push({
            language: codeBlockLanguage,
            content: codeBlockContent.join('\n'),
            position: {
              start: {
                line: lineNum - codeBlockContent.length - 1,
                col: 0,
                offset: codeBlockStart,
              },
              end: {
                line: lineNum,
                col: line.length,
                offset: lineOffset + line.length,
              },
            },
          });

          inCodeBlock = false;
          codeBlockLanguage = undefined;
          codeBlockContent = [];
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line);
      }

      lineOffset += line.length + 1;
    }

    return blocks;
  }

  /**
   * Calculate file statistics
   */
  private static calculateStats(
    content: string,
    links: LinkMetadata[],
    embeds: EmbedMetadata[],
    tags: TagMetadata[],
    headings: HeadingMetadata[]
  ): FileStats {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(w => w.length > 0).length;

    return {
      size: content.length,
      lines: lines.length,
      words,
      characters: content.length,
      links: links.length,
      embeds: embeds.length,
      tags: tags.length,
      headings: headings.length,
    };
  }

  /**
   * Extract metadata for multiple files
   */
  static extractBatch(files: Array<{ path: string; content: string }>): FileMetadata[] {
    return files.map(file => this.extract(file.content, file.path));
  }

  /**
   * Update metadata incrementally
   */
  static updateMetadata(
    existing: FileMetadata,
    newContent: string
  ): FileMetadata {
    // For now, just re-extract everything
    // In the future, could implement incremental updates
    return this.extract(newContent, existing.path);
  }
}

/**
 * Convenience function
 */
export function extractMetadata(content: string, filePath: string): FileMetadata {
  return MetadataExtractor.extract(content, filePath);
}
