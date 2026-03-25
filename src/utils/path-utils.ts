/**
 * Path Utilities - Aerospace-grade path handling
 */

/**
 * Path utilities for file system operations
 */
export class PathUtils {
  /**
   * Normalize a path (remove redundant separators, resolve . and ..)
   */
  static normalize(path: string): string {
    if (!path) return '.';

    // Split path into parts
    const parts = path.split('/').filter(p => p && p !== '.');
    const result: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        if (result.length > 0 && result[result.length - 1] !== '..') {
          result.pop();
        } else if (!path.startsWith('/')) {
          result.push('..');
        }
      } else {
        result.push(part);
      }
    }

    let normalized = result.join('/');
    
    // Preserve leading slash
    if (path.startsWith('/')) {
      normalized = '/' + normalized;
    }
    
    // Preserve trailing slash for directories
    if (path.endsWith('/') && !normalized.endsWith('/')) {
      normalized += '/';
    }

    return normalized || '.';
  }

  /**
   * Join path segments
   */
  static join(...paths: string[]): string {
    if (paths.length === 0) return '.';
    
    const joined = paths
      .filter(p => p)
      .join('/')
      .replace(/\/+/g, '/');
    
    return this.normalize(joined);
  }

  /**
   * Get directory name from path
   */
  static dirname(path: string): string {
    if (!path) return '.';
    
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    
    if (lastSlash === -1) return '.';
    if (lastSlash === 0) return '/';
    
    return normalized.substring(0, lastSlash);
  }

  /**
   * Get base name from path
   */
  static basename(path: string, ext?: string): string {
    if (!path) return '';
    
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    let base = lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
    
    if (ext && base.endsWith(ext)) {
      base = base.substring(0, base.length - ext.length);
    }
    
    return base;
  }

  /**
   * Get file extension
   */
  static extname(path: string): string {
    if (!path) return '';
    
    const base = this.basename(path);
    const lastDot = base.lastIndexOf('.');
    
    if (lastDot === -1 || lastDot === 0) return '';
    
    return base.substring(lastDot);
  }

  /**
   * Get relative path from one path to another
   */
  static relative(from: string, to: string): string {
    const fromParts = this.normalize(from).split('/').filter(p => p);
    const toParts = this.normalize(to).split('/').filter(p => p);
    
    // Find common base
    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }
    
    // Build relative path
    const upCount = fromParts.length - commonLength;
    const relativeParts = Array(upCount).fill('..');
    const remainingParts = toParts.slice(commonLength);
    
    return [...relativeParts, ...remainingParts].join('/') || '.';
  }

  /**
   * Check if path is absolute
   */
  static isAbsolute(path: string): boolean {
    return path.startsWith('/');
  }

  /**
   * Resolve path segments to absolute path
   */
  static resolve(...paths: string[]): string {
    let resolved = '';
    
    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      if (!path) continue;
      
      if (this.isAbsolute(path)) {
        resolved = path;
        break;
      }
      
      resolved = path + (resolved ? '/' + resolved : '');
    }
    
    if (!this.isAbsolute(resolved)) {
      resolved = '/' + resolved;
    }
    
    return this.normalize(resolved);
  }

  /**
   * Parse path into components
   */
  static parse(path: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  } {
    const normalized = this.normalize(path);
    const root = this.isAbsolute(normalized) ? '/' : '';
    const dir = this.dirname(normalized);
    const base = this.basename(normalized);
    const ext = this.extname(normalized);
    const name = this.basename(normalized, ext);
    
    return { root, dir, base, ext, name };
  }

  /**
   * Format path from components
   */
  static format(pathObject: {
    root?: string;
    dir?: string;
    base?: string;
    ext?: string;
    name?: string;
  }): string {
    const { root = '', dir = '', base, ext = '', name = '' } = pathObject;
    
    if (base) {
      return this.join(dir || root, base);
    }
    
    return this.join(dir || root, name + ext);
  }

  /**
   * Check if path is a child of parent path
   */
  static isChild(child: string, parent: string): boolean {
    const childNorm = this.normalize(child);
    const parentNorm = this.normalize(parent);
    
    if (childNorm === parentNorm) return false;
    
    return childNorm.startsWith(parentNorm + '/');
  }

  /**
   * Get common base path
   */
  static commonBase(...paths: string[]): string {
    if (paths.length === 0) return '';
    if (paths.length === 1) return this.dirname(paths[0]);
    
    const normalized = paths.map(p => this.normalize(p));
    const parts = normalized.map(p => p.split('/').filter(x => x));
    
    const minLength = Math.min(...parts.map(p => p.length));
    let commonLength = 0;
    
    for (let i = 0; i < minLength; i++) {
      const part = parts[0][i];
      if (parts.every(p => p[i] === part)) {
        commonLength++;
      } else {
        break;
      }
    }
    
    if (commonLength === 0) return '/';
    
    return '/' + parts[0].slice(0, commonLength).join('/');
  }

  /**
   * Ensure path ends with extension
   */
  static ensureExtension(path: string, ext: string): string {
    const currentExt = this.extname(path);
    const targetExt = ext.startsWith('.') ? ext : '.' + ext;
    
    if (currentExt === targetExt) return path;
    
    return path + targetExt;
  }

  /**
   * Remove extension from path
   */
  static removeExtension(path: string): string {
    const ext = this.extname(path);
    if (!ext) return path;
    
    return path.substring(0, path.length - ext.length);
  }

  /**
   * Change extension
   */
  static changeExtension(path: string, newExt: string): string {
    const withoutExt = this.removeExtension(path);
    const ext = newExt.startsWith('.') ? newExt : '.' + newExt;
    
    return withoutExt + ext;
  }

  /**
   * Sanitize path (remove invalid characters)
   */
  static sanitize(path: string): string {
    return path
      .replace(/[<>:"|?*]/g, '') // Remove invalid characters
      .replace(/\\/g, '/') // Convert backslashes
      .replace(/\/+/g, '/') // Remove duplicate slashes
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+$/, ''); // Remove trailing slashes
  }

  /**
   * Check if path contains invalid characters
   */
  static isValid(path: string): boolean {
    return !/[<>:"|?*\\]/.test(path);
  }

  /**
   * Get unique path (add number suffix if exists)
   */
  static getUniquePath(path: string, existingPaths: string[]): string {
    if (!existingPaths.includes(path)) {
      return path;
    }
    
    const ext = this.extname(path);
    const base = this.removeExtension(path);
    let counter = 1;
    
    while (existingPaths.includes(`${base} ${counter}${ext}`)) {
      counter++;
    }
    
    return `${base} ${counter}${ext}`;
  }
}
