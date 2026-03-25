/**
 * Dataview Query Engine
 * Aerospace-grade query engine for Dataview-style queries
 */

import { FileMetadata } from '../metadata/metadata-extractor';
import { EnhancedMetadataCache } from '../metadata/enhanced-metadata-cache';
import { log } from '../../utils/logger';

export interface QueryResult {
  files: FileMetadata[];
  totalCount: number;
  executionTime: number;
}

export interface QueryOptions {
  from?: string;
  where?: WhereClause[];
  sort?: SortClause[];
  limit?: number;
  offset?: number;
}

export interface WhereClause {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'exists';
  value?: any;
}

export interface SortClause {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Query Engine
 */
export class QueryEngine {
  constructor(private cache: EnhancedMetadataCache) {}

  /**
   * Execute a query
   */
  async execute(options: QueryOptions): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      // Get initial file set
      let files = this.getInitialFileSet(options.from);

      // Apply where clauses
      if (options.where && options.where.length > 0) {
        files = this.applyWhereClause(files, options.where);
      }

      // Apply sorting
      if (options.sort && options.sort.length > 0) {
        files = this.applySorting(files, options.sort);
      }

      const totalCount = files.length;

      // Apply pagination
      if (options.offset !== undefined) {
        files = files.slice(options.offset);
      }

      if (options.limit !== undefined) {
        files = files.slice(0, options.limit);
      }

      const executionTime = Date.now() - startTime;

      log.debug('QueryEngine', `Query executed in ${executionTime}ms, returned ${files.length}/${totalCount} files`);

      return {
        files,
        totalCount,
        executionTime,
      };
    } catch (error) {
      log.error('QueryEngine', 'Query execution failed', error as Error);
      throw error;
    }
  }

  /**
   * Get initial file set based on FROM clause
   */
  private getInitialFileSet(from?: string): FileMetadata[] {
    if (!from) {
      // No FROM clause, return all files
      return this.cache.getAllMetadata();
    }

    // Handle tag queries: #tag
    if (from.startsWith('#')) {
      const paths = this.cache.getFilesWithTag(from);
      return paths.map(path => this.cache.getMetadata(path)).filter(m => m !== null) as FileMetadata[];
    }

    // Handle folder queries: "folder"
    if (from.startsWith('"') && from.endsWith('"')) {
      const folder = from.substring(1, from.length - 1);
      return this.cache.getAllMetadata().filter(m => m.path.startsWith(folder));
    }

    // Handle single file
    const metadata = this.cache.getMetadata(from);
    return metadata ? [metadata] : [];
  }

  /**
   * Apply WHERE clauses
   */
  private applyWhereClause(files: FileMetadata[], clauses: WhereClause[]): FileMetadata[] {
    return files.filter(file => {
      // All clauses must match (AND logic)
      return clauses.every(clause => this.evaluateWhereClause(file, clause));
    });
  }

  /**
   * Evaluate a single WHERE clause
   */
  private evaluateWhereClause(file: FileMetadata, clause: WhereClause): boolean {
    const value = this.getFieldValue(file, clause.field);

    switch (clause.operator) {
      case 'exists':
        return value !== undefined && value !== null;

      case 'eq':
        return value === clause.value;

      case 'ne':
        return value !== clause.value;

      case 'gt':
        return typeof value === 'number' && value > clause.value;

      case 'gte':
        return typeof value === 'number' && value >= clause.value;

      case 'lt':
        return typeof value === 'number' && value < clause.value;

      case 'lte':
        return typeof value === 'number' && value <= clause.value;

      case 'contains':
        if (typeof value === 'string') {
          return value.includes(String(clause.value));
        }
        if (Array.isArray(value)) {
          return value.includes(clause.value);
        }
        return false;

      case 'startsWith':
        return typeof value === 'string' && value.startsWith(String(clause.value));

      case 'endsWith':
        return typeof value === 'string' && value.endsWith(String(clause.value));

      default:
        return false;
    }
  }

  /**
   * Get field value from file metadata
   */
  private getFieldValue(file: FileMetadata, field: string): any {
    // Special fields
    switch (field) {
      case 'file.name':
        return file.path.split('/').pop()?.replace('.md', '');
      
      case 'file.path':
        return file.path;
      
      case 'file.size':
        return file.stats.size;
      
      case 'file.ctime':
      case 'file.mtime':
        return file.timestamp;
      
      case 'file.tags':
        return file.tags.map(t => t.tag);
      
      case 'file.links':
        return file.links.map(l => l.target);
      
      case 'file.outlinks':
        return file.links.filter(l => !l.isEmbed).map(l => l.target);
      
      case 'file.inlinks':
        return this.cache.getBacklinks(file.path).map(bl => bl.sourcePath);
    }

    // Check frontmatter
    if (file.frontmatter && field in file.frontmatter) {
      return file.frontmatter[field];
    }

    // Check inline fields
    if (field in file.inlineFields) {
      const values = file.inlineFields[field];
      return values.length === 1 ? values[0] : values;
    }

    return undefined;
  }

  /**
   * Apply sorting
   */
  private applySorting(files: FileMetadata[], sorts: SortClause[]): FileMetadata[] {
    return files.sort((a, b) => {
      for (const sort of sorts) {
        const aValue = this.getFieldValue(a, sort.field);
        const bValue = this.getFieldValue(b, sort.field);

        const comparison = this.compareValues(aValue, bValue);
        
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      
      return 0;
    });
  }

  /**
   * Compare two values
   */
  private compareValues(a: any, b: any): number {
    // Handle null/undefined
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Handle strings
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Handle booleans
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    // Default: convert to string and compare
    return String(a).localeCompare(String(b));
  }

  /**
   * Query files with tag
   */
  async queryByTag(tag: string): Promise<FileMetadata[]> {
    const result = await this.execute({
      from: tag.startsWith('#') ? tag : `#${tag}`,
    });
    
    return result.files;
  }

  /**
   * Query files in folder
   */
  async queryByFolder(folder: string): Promise<FileMetadata[]> {
    const result = await this.execute({
      from: `"${folder}"`,
    });
    
    return result.files;
  }

  /**
   * Query files with frontmatter field
   */
  async queryByFrontmatter(field: string, value?: any): Promise<FileMetadata[]> {
    const where: WhereClause[] = value !== undefined
      ? [{ field, operator: 'eq', value }]
      : [{ field, operator: 'exists' }];

    const result = await this.execute({ where });
    return result.files;
  }

  /**
   * Query files linking to target
   */
  async queryBacklinks(targetPath: string): Promise<FileMetadata[]> {
    const backlinks = this.cache.getBacklinks(targetPath);
    const paths = backlinks.map(bl => bl.sourcePath);
    
    return paths
      .map(path => this.cache.getMetadata(path))
      .filter(m => m !== null) as FileMetadata[];
  }

  /**
   * Full-text search
   */
  async search(query: string): Promise<FileMetadata[]> {
    const lowerQuery = query.toLowerCase();
    const allFiles = this.cache.getAllMetadata();

    return allFiles.filter(file => {
      // Search in path
      if (file.path.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in frontmatter
      if (file.frontmatter) {
        const frontmatterStr = JSON.stringify(file.frontmatter).toLowerCase();
        if (frontmatterStr.includes(lowerQuery)) {
          return true;
        }
      }

      // Search in tags
      if (file.tags.some(t => t.tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in headings
      if (file.headings.some(h => h.text.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      return false;
    });
  }
}

/**
 * Convenience function to create query engine
 */
export function createQueryEngine(cache: EnhancedMetadataCache): QueryEngine {
  return new QueryEngine(cache);
}
