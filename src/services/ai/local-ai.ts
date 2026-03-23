/**
 * Local AI Service - Aerospace Grade
 * TypeScript bindings for Tauri AI commands with comprehensive error handling
 */

import { invoke } from '@tauri-apps/api/core';
import { log } from '../../utils/logger';
import { ErrorHandler, ErrorSeverity } from '../../utils/errorHandler';

export interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  tokensGenerated: number;
  timeMs: number;
}

export interface ModelInfo {
  name: string;
  path: string;
  sizeBytes: number;
  isLoaded: boolean;
}

/**
 * Local AI service using Qwen model via llama.cpp
 */
export class LocalAIService {
  private static instance: LocalAIService;

  private constructor() {
    log.info('LocalAIService', 'Service initialized');
  }

  static getInstance(): LocalAIService {
    if (!LocalAIService.instance) {
      LocalAIService.instance = new LocalAIService();
    }
    return LocalAIService.instance;
  }

  /**
   * Load AI model from file path
   */
  async loadModel(modelPath: string): Promise<void> {
    log.info('LocalAIService', 'Loading model', { modelPath });
    
    try {
      await invoke('load_ai_model', { modelPath });
      log.info('LocalAIService', 'Model loaded successfully');
    } catch (error) {
      const err = error as Error;
      log.error('LocalAIService', 'Failed to load model', err);
      
      ErrorHandler.handle({
        code: 'AI_MODEL_LOAD_FAILED',
        message: err.message,
        severity: ErrorSeverity.HIGH,
        context: { modelPath },
        recoveryStrategy: 'CHECK_MODEL_PATH',
      });
      
      throw error;
    }
  }

  /**
   * Check if model is loaded
   */
  async isModelLoaded(): Promise<boolean> {
    try {
      const loaded = await invoke<boolean>('is_ai_model_loaded');
      log.debug('LocalAIService', 'Model loaded status', { loaded });
      return loaded;
    } catch (error) {
      log.error('LocalAIService', 'Failed to check model status', error as Error);
      return false;
    }
  }

  /**
   * Unload model to free memory
   */
  async unloadModel(): Promise<void> {
    log.info('LocalAIService', 'Unloading model');
    
    try {
      await invoke('unload_ai_model');
      log.info('LocalAIService', 'Model unloaded successfully');
    } catch (error) {
      log.error('LocalAIService', 'Failed to unload model', error as Error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<ModelInfo | null> {
    try {
      const info = await invoke<ModelInfo | null>('get_ai_model_info');
      return info;
    } catch (error) {
      log.error('LocalAIService', 'Failed to get model info', error as Error);
      return null;
    }
  }

  /**
   * Generate text from prompt
   */
  async generate(request: GenerateRequest): Promise<AIResponse> {
    log.info('LocalAIService', 'Generating text', {
      promptLength: request.prompt.length,
      maxTokens: request.maxTokens,
    });

    try {
      const response = await invoke<AIResponse>('ai_generate', { request });
      
      log.info('LocalAIService', 'Generation complete', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response;
    } catch (error) {
      const err = error as Error;
      log.error('LocalAIService', 'Generation failed', err);
      
      ErrorHandler.handle({
        code: 'AI_GENERATION_FAILED',
        message: err.message,
        severity: ErrorSeverity.MEDIUM,
        context: { promptLength: request.prompt.length },
        recoveryStrategy: 'RETRY',
      });
      
      throw error;
    }
  }

  /**
   * Chat completion with message history
   */
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    log.info('LocalAIService', 'Chat completion', { messageCount: messages.length });

    try {
      const response = await invoke<AIResponse>('ai_chat', { messages });
      
      log.info('LocalAIService', 'Chat complete', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response;
    } catch (error) {
      log.error('LocalAIService', 'Chat failed', error as Error);
      throw error;
    }
  }

  /**
   * Improve text quality
   */
  async improveText(text: string): Promise<string> {
    log.info('LocalAIService', 'Improving text', { textLength: text.length });

    if (!text || text.trim().length === 0) {
      throw new Error('文本不能为空');
    }

    if (text.length > 10000) {
      throw new Error('文本过长，请限制在 10000 字符以内');
    }

    try {
      const response = await invoke<AIResponse>('ai_improve_text', { text });
      
      log.info('LocalAIService', 'Text improved', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response.text;
    } catch (error) {
      const err = error as Error;
      log.error('LocalAIService', 'Improve text failed', err);
      
      ErrorHandler.handle({
        code: 'AI_IMPROVE_FAILED',
        message: err.message,
        severity: ErrorSeverity.MEDIUM,
        context: { textLength: text.length },
        recoveryStrategy: 'RETRY',
      });
      
      throw error;
    }
  }

  /**
   * Summarize text
   */
  async summarizeText(text: string): Promise<string> {
    log.info('LocalAIService', 'Summarizing text', { textLength: text.length });

    if (!text || text.trim().length === 0) {
      throw new Error('文本不能为空');
    }

    if (text.length > 20000) {
      throw new Error('文本过长，请限制在 20000 字符以内');
    }

    try {
      const response = await invoke<AIResponse>('ai_summarize_text', { text });
      
      log.info('LocalAIService', 'Text summarized', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response.text;
    } catch (error) {
      log.error('LocalAIService', 'Summarize failed', error as Error);
      throw error;
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLang: string): Promise<string> {
    log.info('LocalAIService', 'Translating text', {
      textLength: text.length,
      targetLang,
    });

    if (!text || text.trim().length === 0) {
      throw new Error('文本不能为空');
    }

    if (text.length > 10000) {
      throw new Error('文本过长，请限制在 10000 字符以内');
    }

    const validLangs = ['英文', '中文', '日文', '韩文', '法文', '德文', '西班牙文'];
    if (!validLangs.includes(targetLang)) {
      throw new Error(`不支持的目标语言: ${targetLang}`);
    }

    try {
      const response = await invoke<AIResponse>('ai_translate_text', {
        text,
        targetLang,
      });
      
      log.info('LocalAIService', 'Text translated', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response.text;
    } catch (error) {
      log.error('LocalAIService', 'Translate failed', error as Error);
      throw error;
    }
  }

  /**
   * Continue writing from given text
   */
  async continueWriting(text: string): Promise<string> {
    log.info('LocalAIService', 'Continuing writing', { textLength: text.length });

    if (!text || text.trim().length === 0) {
      throw new Error('文本不能为空');
    }

    if (text.length > 5000) {
      throw new Error('文本过长，请限制在 5000 字符以内');
    }

    try {
      const response = await invoke<AIResponse>('ai_continue_writing', { text });
      
      log.info('LocalAIService', 'Writing continued', {
        tokensGenerated: response.tokensGenerated,
        timeMs: response.timeMs,
      });
      
      return response.text;
    } catch (error) {
      log.error('LocalAIService', 'Continue writing failed', error as Error);
      throw error;
    }
  }
}

export const localAI = LocalAIService.getInstance();
