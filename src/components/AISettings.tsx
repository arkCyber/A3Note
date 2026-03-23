/**
 * AI Settings Component - Aerospace Grade
 * UI for managing local AI model configuration
 */

import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useLocalAI } from '../hooks/useLocalAI';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  FolderOpen,
  Info,
  Zap,
} from 'lucide-react';

interface AISettingsProps {
  onClose: () => void;
}

export default function AISettings({ onClose }: AISettingsProps) {
  const {
    isLoaded,
    isLoading,
    error,
    modelInfo,
    loadModel,
    unloadModel,
    clearError,
  } = useLocalAI();

  const [modelPath, setModelPath] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Suggested model paths
  const suggestedPaths = [
    '/Users/arksong/.clawmaster/models/qwen2.5-coder-14b-instruct-q4_k_m.gguf',
    '/Users/arksong/OpenClaw+/models/gguf/qwen2.5-0.5b-instruct-q4_k_m.gguf',
  ];

  useEffect(() => {
    if (modelInfo?.path) {
      setModelPath(modelInfo.path);
    }
  }, [modelInfo]);

  const handleSelectModel = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'GGUF Model',
            extensions: ['gguf'],
          },
        ],
      });

      if (selected) {
        setModelPath(selected as string);
        clearError();
      }
    } catch (err) {
      console.error('Failed to select model:', err);
    }
  };

  const handleLoadModel = async () => {
    if (!modelPath) {
      alert('请先选择模型文件');
      return;
    }

    try {
      await loadModel(modelPath);
      alert('模型加载成功！');
    } catch (err) {
      alert(`模型加载失败: ${(err as Error).message}`);
    }
  };

  const handleUnloadModel = async () => {
    if (confirm('确定要卸载模型吗？这将释放内存。')) {
      try {
        await unloadModel();
        alert('模型已卸载');
      } catch (err) {
        alert(`卸载失败: ${(err as Error).message}`);
      }
    }
  };

  const handleUseSuggestedPath = (path: string) => {
    setModelPath(path);
    clearError();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary" size={28} />
            <div>
              <h2 className="text-xl font-semibold">本地 AI 设置</h2>
              <p className="text-sm text-foreground/60">
                Qwen 2.5 本地推理 (llama.cpp)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Model Status */}
          <div>
            <label className="block text-sm font-medium mb-2">模型状态</label>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded ${
                isLoaded
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {isLoaded ? (
                <>
                  <CheckCircle size={20} />
                  <div className="flex-1">
                    <div className="font-medium">已加载</div>
                    {modelInfo && (
                      <div className="text-xs opacity-75">{modelInfo.name}</div>
                    )}
                  </div>
                  <button
                    onClick={handleUnloadModel}
                    className="px-3 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                  >
                    卸载
                  </button>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span>未加载</span>
                </>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded flex items-start gap-2">
              <XCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{error}</div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Suggested Paths */}
          <div>
            <label className="block text-sm font-medium mb-2">
              推荐的模型路径
            </label>
            <div className="space-y-2">
              {suggestedPaths.map((path, index) => (
                <button
                  key={index}
                  onClick={() => handleUseSuggestedPath(path)}
                  className="w-full text-left px-3 py-2 rounded bg-background hover:bg-accent/10 transition-colors text-sm font-mono"
                >
                  {path}
                </button>
              ))}
            </div>
          </div>

          {/* Model Path */}
          <div>
            <label className="block text-sm font-medium mb-2">模型文件</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
                placeholder="选择 GGUF 模型文件..."
                className="flex-1 px-3 py-2 rounded bg-background border border-border focus:border-primary focus:outline-none font-mono text-sm"
              />
              <button
                onClick={handleSelectModel}
                className="px-4 py-2 rounded bg-primary/20 hover:bg-primary/30 transition-colors flex items-center gap-2"
              >
                <FolderOpen size={16} />
                浏览
              </button>
            </div>
          </div>

          {/* Load Button */}
          <button
            onClick={handleLoadModel}
            disabled={isLoading || !modelPath || isLoaded}
            className="w-full px-4 py-3 rounded bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>加载中...</span>
              </>
            ) : isLoaded ? (
              <span>已加载</span>
            ) : (
              <>
                <Zap size={20} />
                <span>加载模型</span>
              </>
            )}
          </button>

          {/* Information */}
          <div className="bg-background/50 rounded p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-primary">推荐配置</p>
                <ul className="space-y-1 text-foreground/70">
                  <li>• 模型: Qwen 2.5 Coder 14B (Q4_K_M)</li>
                  <li>• 内存需求: ~8-10GB RAM</li>
                  <li>• 推理速度: ~10-20 tokens/s (CPU)</li>
                  <li>• 文件大小: ~8GB</li>
                  <li>• 首次加载: ~15-30 秒</li>
                </ul>
              </div>
            </div>

            {showAdvanced && (
              <div className="pt-3 border-t border-border">
                <p className="font-medium text-sm mb-2">性能提示</p>
                <ul className="space-y-1 text-xs text-foreground/60">
                  <li>• 使用 Q4_K_M 量化可获得最佳性能/质量平衡</li>
                  <li>• 如果有 GPU，推理速度可提升 2-3 倍</li>
                  <li>• 建议关闭其他占用内存的应用</li>
                  <li>• 模型加载后会常驻内存，直到手动卸载</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-primary hover:underline"
            >
              {showAdvanced ? '隐藏' : '显示'}高级信息
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
