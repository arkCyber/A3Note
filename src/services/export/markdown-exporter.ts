import JSZip from 'jszip';
import { ExportOptions, ExportResult } from './types';
import { log } from '../../utils/logger';

/**
 * Markdown Exporter Service
 * Exports Markdown files with optional assets
 */

export class MarkdownExporter {
  async export(content: string, options: ExportOptions): Promise<ExportResult> {
    try {
      log.info('[MarkdownExporter] Starting Markdown export');

      if (options.includeImages) {
        // Export as ZIP with images
        return await this.exportWithAssets(content, options);
      } else {
        // Export as plain Markdown
        return await this.exportPlain(content, options);
      }
    } catch (error) {
      log.error('[MarkdownExporter] Export failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async exportPlain(content: string, options: ExportOptions): Promise<ExportResult> {
    // Create blob
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

    log.info('[MarkdownExporter] Plain Markdown export completed', { size: blob.size });

    return {
      success: true,
      blob,
      size: blob.size,
    };
  }

  private async exportWithAssets(content: string, options: ExportOptions): Promise<ExportResult> {
    const zip = new JSZip();

    // Add main markdown file
    const filename = options.filename || 'document.md';
    zip.file(filename, content);

    // Extract image URLs from markdown
    const imageUrls = this.extractImageUrls(content);

    // Download and add images
    const assetsFolder = zip.folder('assets');
    if (assetsFolder && imageUrls.length > 0) {
      for (const url of imageUrls) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const imageName = this.getImageName(url);
          assetsFolder.file(imageName, blob);
        } catch (error) {
          log.warn('[MarkdownExporter] Failed to download image', url);
        }
      }

      // Update image paths in markdown
      let updatedContent = content;
      imageUrls.forEach(url => {
        const imageName = this.getImageName(url);
        updatedContent = updatedContent.replace(url, `./assets/${imageName}`);
      });

      // Update markdown file with new paths
      zip.file(filename, updatedContent);
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    log.info('[MarkdownExporter] Markdown with assets export completed', { size: zipBlob.size });

    return {
      success: true,
      blob: zipBlob,
      size: zipBlob.size,
    };
  }

  private extractImageUrls(content: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const url = match[1];
      // Only include HTTP(S) URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        urls.push(url);
      }
    }

    return urls;
  }

  private getImageName(url: string): string {
    const parts = url.split('/');
    let name = parts[parts.length - 1];
    
    // Remove query parameters
    name = name.split('?')[0];
    
    // Ensure it has an extension
    if (!name.includes('.')) {
      name += '.jpg';
    }
    
    return name;
  }
}

export const markdownExporter = new MarkdownExporter();
