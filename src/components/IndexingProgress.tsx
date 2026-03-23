// Indexing Progress Component - Aerospace Grade
// Displays progress during batch indexing

import { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { IndexingProgress, IndexingResult } from '../services/ai/batch-indexer';

interface IndexingProgressProps {
  progress: IndexingProgress | null;
  result: IndexingResult | null;
  onClose: () => void;
  onAbort: () => void;
}

export default function IndexingProgressComponent({
  progress,
  result,
  onClose,
  onAbort,
}: IndexingProgressProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-close after completion
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  if (!isVisible) {
    return null;
  }

  const isComplete = !!result;
  const isSuccess = result && result.failed === 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-background border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          {!isComplete && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {isComplete && isSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
          {isComplete && !isSuccess && <XCircle className="w-4 h-4 text-yellow-500" />}
          <span className="font-medium text-sm">
            {!isComplete && '正在索引笔记库...'}
            {isComplete && isSuccess && '索引完成'}
            {isComplete && !isSuccess && '索引完成（有错误）'}
          </span>
        </div>
        <button
          onClick={isComplete ? onClose : onAbort}
          className="p-1 hover:bg-background rounded transition-colors"
          title={isComplete ? '关闭' : '取消'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      {progress && !isComplete && (
        <div className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-foreground/70">
              <span>{progress.current} / {progress.total}</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Current file */}
          <div className="text-xs text-foreground/60 truncate">
            当前: {progress.currentFile}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-500/10 rounded">
              <div className="text-green-500 font-semibold">{result.success}</div>
              <div className="text-foreground/60">成功</div>
            </div>
            {result.failed > 0 && (
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="text-red-500 font-semibold">{result.failed}</div>
                <div className="text-foreground/60">失败</div>
              </div>
            )}
            {result.skipped > 0 && (
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <div className="text-yellow-500 font-semibold">{result.skipped}</div>
                <div className="text-foreground/60">跳过</div>
              </div>
            )}
          </div>

          <div className="text-xs text-foreground/60 text-center">
            耗时: {(result.totalTime / 1000).toFixed(1)} 秒
          </div>
        </div>
      )}
    </div>
  );
}
