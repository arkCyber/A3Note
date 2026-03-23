/**
 * useLocalAI Hook - Aerospace Grade
 * React hook for local AI operations with comprehensive state management
 */

import { useState, useEffect, useCallback } from 'react';
import { localAI } from '../services/ai/local-ai';
import { log } from '../utils/logger';

export interface UseLocalAIReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  modelInfo: any | null;
  loadModel: (modelPath: string) => Promise<void>;
  unloadModel: () => Promise<void>;
  improveText: (text: string) => Promise<string>;
  summarizeText: (text: string) => Promise<string>;
  translateText: (text: string, targetLang: string) => Promise<string>;
  continueWriting: (text: string) => Promise<string>;
  clearError: () => void;
}

/**
 * Hook for managing local AI operations
 */
export function useLocalAI(): UseLocalAIReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<any | null>(null);

  // Check model status on mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  /**
   * Check if model is loaded
   */
  const checkModelStatus = useCallback(async () => {
    try {
      const loaded = await localAI.isModelLoaded();
      setIsLoaded(loaded);
      
      if (loaded) {
        const info = await localAI.getModelInfo();
        setModelInfo(info);
      }
      
      log.info('useLocalAI', 'Model status checked', { loaded });
    } catch (err) {
      log.error('useLocalAI', 'Failed to check model status', err as Error);
    }
  }, []);

  /**
   * Load AI model
   */
  const loadModel = useCallback(async (modelPath: string) => {
    log.info('useLocalAI', 'Loading model', { modelPath });
    setIsLoading(true);
    setError(null);

    try {
      await localAI.loadModel(modelPath);
      setIsLoaded(true);
      
      const info = await localAI.getModelInfo();
      setModelInfo(info);
      
      log.info('useLocalAI', 'Model loaded successfully');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      log.error('useLocalAI', 'Failed to load model', err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unload AI model
   */
  const unloadModel = useCallback(async () => {
    log.info('useLocalAI', 'Unloading model');
    setIsLoading(true);
    setError(null);

    try {
      await localAI.unloadModel();
      setIsLoaded(false);
      setModelInfo(null);
      log.info('useLocalAI', 'Model unloaded successfully');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      log.error('useLocalAI', 'Failed to unload model', err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Improve text quality
   */
  const improveText = useCallback(async (text: string): Promise<string> => {
    if (!isLoaded) {
      throw new Error('AI 模型未加载');
    }

    log.info('useLocalAI', 'Improving text', { textLength: text.length });
    setIsLoading(true);
    setError(null);

    try {
      const result = await localAI.improveText(text);
      log.info('useLocalAI', 'Text improved successfully');
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  /**
   * Summarize text
   */
  const summarizeText = useCallback(async (text: string): Promise<string> => {
    if (!isLoaded) {
      throw new Error('AI 模型未加载');
    }

    log.info('useLocalAI', 'Summarizing text', { textLength: text.length });
    setIsLoading(true);
    setError(null);

    try {
      const result = await localAI.summarizeText(text);
      log.info('useLocalAI', 'Text summarized successfully');
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  /**
   * Translate text
   */
  const translateText = useCallback(async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!isLoaded) {
      throw new Error('AI 模型未加载');
    }

    log.info('useLocalAI', 'Translating text', {
      textLength: text.length,
      targetLang,
    });
    setIsLoading(true);
    setError(null);

    try {
      const result = await localAI.translateText(text, targetLang);
      log.info('useLocalAI', 'Text translated successfully');
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  /**
   * Continue writing
   */
  const continueWriting = useCallback(async (text: string): Promise<string> => {
    if (!isLoaded) {
      throw new Error('AI 模型未加载');
    }

    log.info('useLocalAI', 'Continuing writing', { textLength: text.length });
    setIsLoading(true);
    setError(null);

    try {
      const result = await localAI.continueWriting(text);
      log.info('useLocalAI', 'Writing continued successfully');
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    modelInfo,
    loadModel,
    unloadModel,
    improveText,
    summarizeText,
    translateText,
    continueWriting,
    clearError,
  };
}
