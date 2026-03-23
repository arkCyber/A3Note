// RAG Service - Aerospace Grade
// TypeScript service for Retrieval Augmented Generation

import { invoke } from '@tauri-apps/api/tauri';
import type { SearchResult } from './semantic-search';

/**
 * RAG query response
 */
export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  tokens_generated: number;
  time_ms: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
  timestamp: number;
}

/**
 * RAG Service
 * Provides knowledge base question answering using Retrieval Augmented Generation
 */
export class RAGService {
  private static instance: RAGService;
  private chatHistory: ChatMessage[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Query the knowledge base
   * 
   * @param question - User's question
   * @param topK - Number of relevant documents to retrieve
   * @param minSimilarity - Minimum similarity threshold
   * @returns RAG response with answer and sources
   */
  async query(
    question: string,
    topK: number = 5,
    minSimilarity: number = 0.7
  ): Promise<RAGResponse> {
    try {
      console.log(`[RAG] Query: "${question}"`);
      
      const startTime = Date.now();
      
      const response = await invoke<RAGResponse>('rag_query', {
        question,
        topK,
        minSimilarity,
      });

      const elapsed = Date.now() - startTime;
      console.log(`[RAG] Response received in ${elapsed}ms`);
      console.log(`[RAG] Answer: ${response.answer.substring(0, 100)}...`);
      console.log(`[RAG] Sources: ${response.sources.length}`);

      // Add to chat history
      this.addToHistory('user', question);
      this.addToHistory('assistant', response.answer, response.sources);

      return response;
    } catch (error) {
      console.error('[RAG] Query failed:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   * 
   * @returns Array of chat messages
   */
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.chatHistory = [];
    console.log('[RAG] Chat history cleared');
  }

  /**
   * Add message to chat history
   * 
   * @param role - Message role
   * @param content - Message content
   * @param sources - Optional sources
   */
  private addToHistory(
    role: 'user' | 'assistant',
    content: string,
    sources?: SearchResult[]
  ): void {
    this.chatHistory.push({
      role,
      content,
      sources,
      timestamp: Date.now(),
    });

    // Keep only last 50 messages
    if (this.chatHistory.length > 50) {
      this.chatHistory = this.chatHistory.slice(-50);
    }
  }

  /**
   * Export chat history as markdown
   * 
   * @returns Markdown formatted chat history
   */
  exportChatHistory(): string {
    let markdown = '# 知识库对话历史\n\n';
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`;
    markdown += '---\n\n';

    for (const message of this.chatHistory) {
      const time = new Date(message.timestamp).toLocaleTimeString();
      
      if (message.role === 'user') {
        markdown += `## 🙋 用户 (${time})\n\n`;
        markdown += `${message.content}\n\n`;
      } else {
        markdown += `## 🤖 助手 (${time})\n\n`;
        markdown += `${message.content}\n\n`;
        
        if (message.sources && message.sources.length > 0) {
          markdown += `**来源**:\n`;
          for (const source of message.sources) {
            markdown += `- [[${source.title}]] (相关度: ${(source.similarity * 100).toFixed(0)}%)\n`;
          }
          markdown += '\n';
        }
      }
      
      markdown += '---\n\n';
    }

    return markdown;
  }

  /**
   * Get suggested questions based on current context
   * 
   * @param context - Current context
   * @returns Array of suggested questions
   */
  getSuggestedQuestions(context?: string): string[] {
    const suggestions = [
      '总结我最近的笔记',
      '我对某个主题的看法是什么？',
      '帮我找到相关的笔记',
      '这个概念在我的笔记中是如何定义的？',
      '我之前学习过哪些相关内容？',
    ];

    // TODO: Use AI to generate context-aware suggestions
    return suggestions;
  }
}

// Export singleton instance
export const ragService = RAGService.getInstance();
