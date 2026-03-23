import { useState, useCallback } from 'react';
import { printService, PrintOptions } from '../services/export/print-service';
import { log } from '../utils/logger';

/**
 * Hook for print functionality
 * 
 * @aerospace-grade
 */

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const print = useCallback(async (content: string, options: PrintOptions = {}) => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      log.info('[usePrint] Starting print');
      await printService.print(content, options);
      log.info('[usePrint] Print completed');
    } catch (error) {
      const errorMessage = (error as Error).message;
      setPrintError(errorMessage);
      log.error('[usePrint] Print error', error as Error);
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const preview = useCallback(async (content: string, options: PrintOptions = {}) => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      log.info('[usePrint] Opening print preview');
      await printService.preview(content, options);
      log.info('[usePrint] Print preview opened');
    } catch (error) {
      const errorMessage = (error as Error).message;
      setPrintError(errorMessage);
      log.error('[usePrint] Preview error', error as Error);
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setPrintError(null);
  }, []);

  return {
    isPrinting,
    printError,
    print,
    preview,
    resetError,
  };
}
