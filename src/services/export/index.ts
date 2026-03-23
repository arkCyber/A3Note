import { pdfExporter } from './pdf-exporter';
import { htmlExporter } from './html-exporter';
import { markdownExporter } from './markdown-exporter';
import { wordExporter } from './word-exporter';
import { pptExporter } from './ppt-exporter';
import { ExportOptions, ExportResult, ExportFormat } from './types';
import { log } from '../../utils/logger';

/**
 * Unified Export Service
 * Provides a single interface for all export formats
 */

export class ExportService {
  async export(content: string, options: ExportOptions): Promise<ExportResult> {
    log.info('[ExportService] Starting export', { format: options.format });

    try {
      let result: ExportResult;

      switch (options.format) {
        case 'pdf':
          result = await pdfExporter.export(content, options);
          break;
        
        case 'html':
          result = await htmlExporter.export(content, options);
          break;
        
        case 'markdown':
          result = await markdownExporter.export(content, options);
          break;
        
        case 'docx':
          result = await wordExporter.export(content, options);
          break;
        
        case 'pptx':
          result = await pptExporter.export(content, options);
          break;
        
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      if (result.success && result.blob) {
        // Trigger download
        this.downloadBlob(result.blob, this.getFilename(options));
      }

      return result;
    } catch (error) {
      log.error('[ExportService] Export failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    log.info('[ExportService] Download triggered', { filename, size: blob.size });
  }

  private getFilename(options: ExportOptions): string {
    const base = options.filename || 'document';
    const extension = this.getExtension(options.format);
    
    // Remove existing extension if present
    const baseName = base.replace(/\.[^/.]+$/, '');
    
    return `${baseName}.${extension}`;
  }

  private getExtension(format: ExportFormat): string {
    switch (format) {
      case 'pdf':
        return 'pdf';
      case 'html':
        return 'html';
      case 'markdown':
        return 'md';
      case 'docx':
        return 'docx';
      case 'pptx':
        return 'pptx';
      default:
        return 'txt';
    }
  }
}

export const exportService = new ExportService();

// Re-export types
export * from './types';
