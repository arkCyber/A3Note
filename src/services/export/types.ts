/**
 * Export Service Types
 * Defines interfaces for file export functionality
 */

export type ExportFormat = 'pdf' | 'html' | 'markdown' | 'docx';

export interface ExportOptions {
  format: ExportFormat;
  includeImages?: boolean;
  includeTOC?: boolean;
  pageSize?: 'A4' | 'Letter';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  cssTheme?: 'light' | 'dark' | 'auto';
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  blob?: Blob;
  error?: string;
  size?: number;
}

export interface Exporter {
  export(content: string, options: ExportOptions): Promise<ExportResult>;
}

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'generating' | 'saving' | 'complete';
  progress: number; // 0-100
  message: string;
}
