/**
 * AI Toolbar Component - Aerospace Grade
 * Toolbar with multiple AI action buttons
 */

import { useState } from 'react';
import { Sparkles, FileText, Languages, PenTool, ChevronDown } from 'lucide-react';
import LocalAIButton from './LocalAIButton';

interface AIToolbarProps {
  selectedText: string;
  onReplace: (text: string) => void;
}

export default function AIToolbar({ selectedText, onReplace }: AIToolbarProps) {
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [targetLang, setTargetLang] = useState('英文');

  const languages = ['英文', '中文', '日文', '韩文', '法文', '德文', '西班牙文'];

  const handleTranslate = (lang: string) => {
    setTargetLang(lang);
    setShowTranslateMenu(false);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-secondary/50">
      <div className="flex items-center gap-1 text-xs text-foreground/60 mr-2">
        <Sparkles size={14} className="text-primary" />
        <span>AI 工具</span>
      </div>

      {/* Improve */}
      <LocalAIButton
        selectedText={selectedText}
        onReplace={onReplace}
        action="improve"
      />

      {/* Summarize */}
      <LocalAIButton
        selectedText={selectedText}
        onReplace={onReplace}
        action="summarize"
      />

      {/* Translate */}
      <div className="relative">
        <button
          onClick={() => setShowTranslateMenu(!showTranslateMenu)}
          className="p-1 hover:bg-accent/10 rounded transition-colors flex items-center gap-1"
          title="AI 翻译"
        >
          <Languages size={16} />
          <ChevronDown size={12} />
        </button>

        {showTranslateMenu && (
          <div className="absolute top-full left-0 mt-1 bg-secondary border border-border rounded shadow-lg z-10 min-w-[120px]">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleTranslate(lang)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent/10 transition-colors"
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {showTranslateMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowTranslateMenu(false)}
        />
      )}

      {/* Continue Writing */}
      <LocalAIButton
        selectedText={selectedText}
        onReplace={onReplace}
        action="continue"
      />
    </div>
  );
}
