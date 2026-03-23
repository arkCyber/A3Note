// RAG Chat Component - Aerospace Grade
// Knowledge base chat interface

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, X, Download } from 'lucide-react';
import { ragService, type RAGResponse, type ChatMessage } from '../services/ai/rag';
import { useTranslation } from 'react-i18next';

interface RAGChatProps {
  onClose?: () => void;
}

export default function RAGChat({ onClose }: RAGChatProps) {
  const { t } = useTranslation('rag');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    setMessages(ragService.getChatHistory());
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await ragService.query(question, 5, 0.7);
      setMessages(ragService.getChatHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败');
      console.error('RAG query error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear history
  const handleClear = () => {
    if (confirm('确定要清空对话历史吗？')) {
      ragService.clearHistory();
      setMessages([]);
    }
  };

  // Export history
  const handleExport = () => {
    const markdown = ragService.exportChatHistory();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Suggested questions
  const suggestedQuestions = ragService.getSuggestedQuestions();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">💬 问你的笔记库</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="导出对话"
            disabled={messages.length === 0}
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="清空对话"
            disabled={messages.length === 0}
          >
            <X size={18} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded transition-colors"
              title="关闭"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-foreground/60 py-8">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">开始与你的笔记库对话</p>
            <p className="text-sm mb-4">基于你的笔记内容回答问题</p>
            
            {/* Suggested questions */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold mb-3">试试这些问题：</p>
              {suggestedQuestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="block w-full max-w-md mx-auto px-4 py-2 text-sm text-left bg-secondary hover:bg-secondary/80 rounded transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <p className="text-xs font-semibold mb-2">📚 来源:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, i) => (
                      <div key={i} className="text-xs flex items-center gap-2">
                        <FileText size={12} />
                        <span className="flex-1">{source.title}</span>
                        <span className="text-foreground/60">
                          {(source.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-foreground/60 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">正在思考...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
            ❌ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="问一个关于你笔记的问题..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-foreground/60 mt-2">
          按 Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}
