/**
 * Local AI Button Component - Aerospace Grade
 * AI action button for editor toolbar with comprehensive error handling
 */

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, FileText, Languages, PenTool } from 'lucide-react';
import { useLocalAI } from '../hooks/useLocalAI';

interface LocalAIButtonProps {
  selectedText: string;
  onReplace: (text: string) => void;
  action?: 'improve' | 'summarize' | 'translate' | 'continue';
  targetLang?: string;
}

export default function LocalAIButton({
  selectedText,
  onReplace,
  action = 'improve',
  targetLang = '英文',
}: LocalAIButtonProps) {
  const { isLoaded, improveText, summarizeText, translateText, continueWriting } = useLocalAI();
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (!selectedText && action !== 'continue') {
      alert('请先选择文本');
      return;
    }

    if (!isLoaded) {
      alert('AI 模型未加载，请在设置中加载模型');
      return;
    }

    setProcessing(true);
    try {
      let result: string;

      switch (action) {
        case 'improve':
          result = await improveText(selectedText);
          break;
        case 'summarize':
          result = await summarizeText(selectedText);
          break;
        case 'translate':
          result = await translateText(selectedText, targetLang);
          break;
        case 'continue':
          result = await continueWriting(selectedText || '');
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      onReplace(result);
    } catch (error) {
      alert(`AI 处理失败: ${(error as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getIcon = () => {
    if (processing) return <Loader2 size={16} className="animate-spin text-primary" />;
    
    switch (action) {
      case 'improve':
        return <Sparkles size={16} className={isLoaded ? 'text-primary' : 'text-gray-400'} />;
      case 'summarize':
        return <FileText size={16} className={isLoaded ? 'text-primary' : 'text-gray-400'} />;
      case 'translate':
        return <Languages size={16} className={isLoaded ? 'text-primary' : 'text-gray-400'} />;
      case 'continue':
        return <PenTool size={16} className={isLoaded ? 'text-primary' : 'text-gray-400'} />;
    }
  };

  const getTitle = () => {
    if (!isLoaded) return 'AI 模型未加载';
    
    switch (action) {
      case 'improve':
        return 'AI 改写 (本地 Qwen)';
      case 'summarize':
        return 'AI 摘要';
      case 'translate':
        return `AI 翻译 (${targetLang})`;
      case 'continue':
        return 'AI 续写';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded || processing}
      className="p-1 hover:bg-accent/10 rounded disabled:opacity-50 transition-colors"
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
}
