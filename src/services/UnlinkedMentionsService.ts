/**
 * Unlinked Mentions Service - Aerospace-grade unlinked mentions detection
 * Finds mentions of current file in other files that are not linked
 */

export interface UnlinkedMention {
  file: string;
  line: number;
  column: number;
  context: string;
  matchedText: string;
}

export interface UnlinkedMentionsResult {
  mentions: UnlinkedMention[];
  totalCount: number;
  searchedFiles: number;
}

/**
 * Service for finding unlinked mentions
 */
export class UnlinkedMentionsService {
  /**
   * Find unlinked mentions of a file in the workspace
   */
  async findUnlinkedMentions(
    targetFilePath: string,
    workspaceFiles: string[],
    getFileContent: (path: string) => Promise<string>
  ): Promise<UnlinkedMentionsResult> {
    const mentions: UnlinkedMention[] = [];
    const fileName = this.extractFileName(targetFilePath);
    const fileNameVariants = this.generateFileNameVariants(fileName);
    
    let searchedFiles = 0;

    for (const filePath of workspaceFiles) {
      // Skip the target file itself
      if (filePath === targetFilePath) {
        continue;
      }

      try {
        const content = await getFileContent(filePath);
        const fileMentions = this.findMentionsInContent(
          content,
          fileNameVariants,
          filePath,
          targetFilePath
        );
        
        mentions.push(...fileMentions);
        searchedFiles++;
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }

    return {
      mentions,
      totalCount: mentions.length,
      searchedFiles,
    };
  }

  /**
   * Extract file name from path (without extension)
   */
  private extractFileName(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.md$/, '');
  }

  /**
   * Generate variants of file name for matching
   */
  private generateFileNameVariants(fileName: string): string[] {
    const variants: string[] = [fileName];

    // Add lowercase variant
    if (fileName !== fileName.toLowerCase()) {
      variants.push(fileName.toLowerCase());
    }

    // Add uppercase variant
    if (fileName !== fileName.toUpperCase()) {
      variants.push(fileName.toUpperCase());
    }

    // Add title case variant
    const titleCase = this.toTitleCase(fileName);
    if (titleCase !== fileName) {
      variants.push(titleCase);
    }

    // Add variants with spaces replaced by hyphens/underscores
    if (fileName.includes(' ')) {
      variants.push(fileName.replace(/ /g, '-'));
      variants.push(fileName.replace(/ /g, '_'));
    }

    // Add variants with hyphens/underscores replaced by spaces
    if (fileName.includes('-')) {
      variants.push(fileName.replace(/-/g, ' '));
    }
    if (fileName.includes('_')) {
      variants.push(fileName.replace(/_/g, ' '));
    }

    return [...new Set(variants)]; // Remove duplicates
  }

  /**
   * Convert to title case
   */
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Find mentions in file content
   */
  private findMentionsInContent(
    content: string,
    fileNameVariants: string[],
    sourceFile: string,
    targetFile: string
  ): UnlinkedMention[] {
    const mentions: UnlinkedMention[] = [];
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip if line contains a link to the target file
      if (this.containsLinkToFile(line, targetFile)) {
        continue;
      }

      // Check each variant
      for (const variant of fileNameVariants) {
        const matches = this.findVariantInLine(line, variant);

        for (const match of matches) {
          // Get context (surrounding text)
          const context = this.extractContext(lines, lineIndex, match.column);

          mentions.push({
            file: sourceFile,
            line: lineIndex + 1, // 1-indexed
            column: match.column,
            context,
            matchedText: match.text,
          });
        }
      }
    }

    return mentions;
  }

  /**
   * Check if line contains a link to the target file
   */
  private containsLinkToFile(line: string, targetFile: string): boolean {
    const fileName = this.extractFileName(targetFile);

    // Check for wikilinks: [[fileName]]
    if (line.includes(`[[${fileName}]]`) || line.includes(`[[${fileName}|`)) {
      return true;
    }

    // Check for markdown links: [text](fileName.md)
    if (line.includes(`](${fileName}.md)`) || line.includes(`](${targetFile})`)) {
      return true;
    }

    return false;
  }

  /**
   * Find variant occurrences in line
   */
  private findVariantInLine(line: string, variant: string): Array<{ column: number; text: string }> {
    const matches: Array<{ column: number; text: string }> = [];
    const regex = new RegExp(`\\b${this.escapeRegex(variant)}\\b`, 'gi');
    let match;

    while ((match = regex.exec(line)) !== null) {
      matches.push({
        column: match.index,
        text: match[0],
      });
    }

    return matches;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Extract context around the mention
   */
  private extractContext(lines: string[], lineIndex: number, column: number): string {
    const line = lines[lineIndex];
    const contextRadius = 50; // Characters before and after

    const start = Math.max(0, column - contextRadius);
    const end = Math.min(line.length, column + contextRadius);

    let context = line.substring(start, end);

    // Add ellipsis if truncated
    if (start > 0) {
      context = '...' + context;
    }
    if (end < line.length) {
      context = context + '...';
    }

    return context;
  }

  /**
   * Group mentions by file
   */
  groupByFile(mentions: UnlinkedMention[]): Map<string, UnlinkedMention[]> {
    const grouped = new Map<string, UnlinkedMention[]>();

    for (const mention of mentions) {
      const existing = grouped.get(mention.file) || [];
      existing.push(mention);
      grouped.set(mention.file, existing);
    }

    return grouped;
  }

  /**
   * Sort mentions by relevance
   */
  sortByRelevance(mentions: UnlinkedMention[]): UnlinkedMention[] {
    return mentions.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.matchedText === a.matchedText.toLowerCase();
      const bExact = b.matchedText === b.matchedText.toLowerCase();

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then sort by file name
      return a.file.localeCompare(b.file);
    });
  }

  /**
   * Filter mentions by minimum context length
   */
  filterByContextLength(mentions: UnlinkedMention[], minLength: number): UnlinkedMention[] {
    return mentions.filter(m => m.context.length >= minLength);
  }

  /**
   * Get statistics about unlinked mentions
   */
  getStatistics(result: UnlinkedMentionsResult): {
    totalMentions: number;
    uniqueFiles: number;
    averageMentionsPerFile: number;
    searchedFiles: number;
  } {
    const uniqueFiles = new Set(result.mentions.map(m => m.file)).size;

    return {
      totalMentions: result.totalCount,
      uniqueFiles,
      averageMentionsPerFile: uniqueFiles > 0 ? result.totalCount / uniqueFiles : 0,
      searchedFiles: result.searchedFiles,
    };
  }
}

// Global instance
export const unlinkedMentionsService = new UnlinkedMentionsService();
