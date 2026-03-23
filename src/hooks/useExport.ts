import { useState, useCallback } from 'react';
import { exportService, ExportOptions, ExportResult } from '../services/export';
import { log } from '../utils/logger';

/**
 * Hook for file export functionality
 */

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportFile = useCallback(async (
    content: string,
    options: ExportOptions
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      log.info('[useExport] Starting export', { format: options.format });
      
      // Simulate progress updates
      setExportProgress(25);
      
      const result = await exportService.export(content, options);
      
      setExportProgress(100);
      
      if (!result.success) {
        setExportError(result.error || 'Export failed');
        log.error('[useExport] Export failed', new Error(result.error));
      } else {
        log.info('[useExport] Export completed successfully');
      }
      
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      setExportError(errorMessage);
      log.error('[useExport] Export error', error as Error);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsExporting(false);
      // Reset progress after a delay
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, []);

  const exportAsPDF = useCallback(async (content: string, filename?: string) => {
    return exportFile(content, {
      format: 'pdf',
      filename,
      includeImages: true,
      includeTOC: false,
      pageSize: 'A4',
      cssTheme: 'light',
    });
  }, [exportFile]);

  const exportAsHTML = useCallback(async (content: string, filename?: string) => {
    return exportFile(content, {
      format: 'html',
      filename,
      includeImages: true,
      cssTheme: 'auto',
    });
  }, [exportFile]);

  const exportAsMarkdown = useCallback(async (content: string, filename?: string, includeImages = false) => {
    return exportFile(content, {
      format: 'markdown',
      filename,
      includeImages,
    });
  }, [exportFile]);

  const exportAsWord = useCallback(async (content: string, filename?: string) => {
    return exportFile(content, {
      format: 'docx',
      filename,
      includeImages: true,
      pageSize: 'A4',
    });
  }, [exportFile]);

  const exportAsPPT = useCallback(async (content: string, filename?: string) => {
    return exportFile(content, {
      format: 'pptx',
      filename,
    });
  }, [exportFile]);

  const resetError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportProgress,
    exportError,
    exportFile,
    exportAsPDF,
    exportAsHTML,
    exportAsMarkdown,
    exportAsWord,
    exportAsPPT,
    resetError,
  };
}
