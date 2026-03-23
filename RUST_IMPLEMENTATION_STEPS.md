# Rust + llama.cpp 实施步骤详解

**目标**: 为 A3Note 添加基于 Rust 和 llama.cpp 的本地 AI 推理  
**模型**: Qwen 3.5 9B  
**预计时间**: 2-3 天

---

## 📋 完整实施清单

### 阶段 1: 环境准备（30 分钟）

#### 1.1 安装系统依赖

```bash
# macOS
brew install cmake

# Ubuntu/Debian
sudo apt-get install cmake build-essential

# 验证安装
cmake --version
```

#### 1.2 下载 Qwen 模型

```bash
# 方法 1: 使用 huggingface-cli
pip install huggingface-hub
huggingface-cli download \
  Qwen/Qwen2.5-9B-Instruct-GGUF \
  qwen2.5-9b-instruct-q4_k_m.gguf \
  --local-dir ./models/qwen

# 方法 2: 手动下载
# 访问: https://huggingface.co/Qwen/Qwen2.5-9B-Instruct-GGUF
# 下载: qwen2.5-9b-instruct-q4_k_m.gguf (~5.5GB)
```

#### 1.3 验证模型

```bash
# 检查文件
ls -lh models/qwen/qwen2.5-9b-instruct-q4_k_m.gguf

# 应该看到约 5.5GB 的文件
```

---

### 阶段 2: Rust 后端实现（4-6 小时）

#### 2.1 添加 Cargo 依赖

```bash
cd src-tauri
```

编辑 `Cargo.toml`:

```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
anyhow = "1.0"
thiserror = "1.0"

# llama.cpp Rust 绑定
llm = { version = "0.1.1", features = ["llama"] }
# 或使用
# llama-cpp-2 = "0.1"

# 异步支持
futures = "0.3"
async-stream = "0.3"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }
```

#### 2.2 创建项目结构

```bash
cd src-tauri/src
mkdir -p ai
touch ai/mod.rs
touch ai/service.rs
touch ai/llama.rs
touch ai/types.rs

mkdir -p commands
touch commands/mod.rs
touch commands/ai.rs
```

最终结构:
```
src-tauri/
  src/
    ai/
      mod.rs          # AI 模块导出
      service.rs      # AI 服务管理
      llama.rs        # llama.cpp 绑定
      types.rs        # 类型定义
    commands/
      mod.rs          # 命令模块导出
      ai.rs           # AI 相关命令
    lib.rs            # 库入口
    main.rs           # 主程序
```

#### 2.3 实现核心代码

**文件 1: `src-tauri/src/ai/types.rs`**

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub context_size: usize,
    pub num_threads: usize,
    pub gpu_layers: i32,
    pub model_path: Option<String>,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            context_size: 4096,
            num_threads: num_cpus::get(),
            gpu_layers: 0,
            model_path: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateRequest {
    pub prompt: String,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
}

impl Default for GenerateRequest {
    fn default() -> Self {
        Self {
            prompt: String::new(),
            max_tokens: Some(512),
            temperature: Some(0.7),
            top_p: Some(0.9),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}
```

**文件 2: `src-tauri/src/ai/llama.rs`**

```rust
use anyhow::Result;
use llm::models::Llama;
use llm::{InferenceParameters, InferenceSession, Model, ModelParameters};
use std::path::PathBuf;
use std::sync::Arc;

use super::types::*;

pub struct LlamaModel {
    model: Arc<Llama>,
}

impl LlamaModel {
    pub fn load(model_path: PathBuf, config: &AIConfig) -> Result<Self> {
        let model_params = ModelParameters {
            context_size: config.context_size,
            ..Default::default()
        };

        let model = llm::load::<Llama>(
            &model_path,
            llm::TokenizerSource::Embedded,
            model_params,
            llm::load_progress_callback_stdout,
        )?;

        Ok(Self {
            model: Arc::new(model),
        })
    }

    pub fn generate(&self, request: &GenerateRequest) -> Result<String> {
        let mut session = self.model.start_session(Default::default());
        let mut output = String::new();

        let params = InferenceParameters {
            n_threads: num_cpus::get(),
            n_batch: 8,
            top_p: request.top_p.unwrap_or(0.9),
            temperature: request.temperature.unwrap_or(0.7),
            ..Default::default()
        };

        let max_tokens = request.max_tokens.unwrap_or(512);
        let mut tokens_generated = 0;

        session.infer::<std::convert::Infallible>(
            self.model.as_ref(),
            &mut rand::thread_rng(),
            &llm::InferenceRequest {
                prompt: request.prompt.as_str().into(),
                parameters: &params,
                play_back_previous_tokens: false,
                maximum_token_count: Some(max_tokens),
            },
            &mut Default::default(),
            |t| {
                match t {
                    llm::InferenceResponse::InferredToken(token) => {
                        output.push_str(&token);
                        tokens_generated += 1;
                        Ok(llm::InferenceFeedback::Continue)
                    }
                    llm::InferenceResponse::EotToken => {
                        Ok(llm::InferenceFeedback::Halt)
                    }
                    _ => Ok(llm::InferenceFeedback::Continue),
                }
            },
        )?;

        Ok(output)
    }
}
```

**文件 3: `src-tauri/src/ai/service.rs`**

```rust
use anyhow::Result;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use super::llama::LlamaModel;
use super::types::*;

pub struct AIService {
    model: Arc<Mutex<Option<LlamaModel>>>,
    config: AIConfig,
}

impl AIService {
    pub fn new(config: AIConfig) -> Self {
        Self {
            model: Arc::new(Mutex::new(None)),
            config,
        }
    }

    pub fn load_model(&self, model_path: PathBuf) -> Result<()> {
        let model = LlamaModel::load(model_path, &self.config)?;
        let mut model_lock = self.model.lock().unwrap();
        *model_lock = Some(model);
        Ok(())
    }

    pub fn is_loaded(&self) -> bool {
        self.model.lock().unwrap().is_some()
    }

    pub fn generate(&self, request: GenerateRequest) -> Result<String> {
        let model_lock = self.model.lock().unwrap();
        let model = model_lock
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("Model not loaded"))?;

        model.generate(&request)
    }

    pub fn chat(&self, messages: Vec<ChatMessage>) -> Result<String> {
        let prompt = self.format_chat_prompt(messages);
        let request = GenerateRequest {
            prompt,
            ..Default::default()
        };
        self.generate(request)
    }

    fn format_chat_prompt(&self, messages: Vec<ChatMessage>) -> String {
        let mut prompt = String::new();
        for msg in messages {
            match msg.role.as_str() {
                "system" => {
                    prompt.push_str(&format!(
                        "<|im_start|>system\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                "user" => {
                    prompt.push_str(&format!(
                        "<|im_start|>user\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                "assistant" => {
                    prompt.push_str(&format!(
                        "<|im_start|>assistant\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                _ => {}
            }
        }
        prompt.push_str("<|im_start|>assistant\n");
        prompt
    }
}
```

**文件 4: `src-tauri/src/ai/mod.rs`**

```rust
pub mod llama;
pub mod service;
pub mod types;

pub use service::AIService;
pub use types::*;
```

**文件 5: `src-tauri/src/commands/ai.rs`**

```rust
use tauri::State;
use std::sync::Arc;
use crate::ai::{AIService, GenerateRequest, ChatMessage};

#[tauri::command]
pub fn load_ai_model(
    ai_service: State<'_, Arc<AIService>>,
    model_path: String,
) -> Result<(), String> {
    ai_service
        .load_model(model_path.into())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn is_ai_model_loaded(ai_service: State<'_, Arc<AIService>>) -> bool {
    ai_service.is_loaded()
}

#[tauri::command]
pub fn ai_generate(
    ai_service: State<'_, Arc<AIService>>,
    request: GenerateRequest,
) -> Result<String, String> {
    ai_service.generate(request).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ai_chat(
    ai_service: State<'_, Arc<AIService>>,
    messages: Vec<ChatMessage>,
) -> Result<String, String> {
    ai_service.chat(messages).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ai_improve_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
) -> Result<String, String> {
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: "你是一个专业的写作助手，帮助改进文本质量。".to_string(),
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!("请改进以下文本：\n\n{}", text),
        },
    ];
    ai_service.chat(messages).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ai_summarize_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
) -> Result<String, String> {
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: "你是一个专业的摘要助手。".to_string(),
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!("请总结以下内容：\n\n{}", text),
        },
    ];
    ai_service.chat(messages).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ai_translate_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
    target_lang: String,
) -> Result<String, String> {
    let messages = vec![ChatMessage {
        role: "user".to_string(),
        content: format!("请将以下内容翻译为{}：\n\n{}", target_lang, text),
    }];
    ai_service.chat(messages).map_err(|e| e.to_string())
}
```

**文件 6: `src-tauri/src/commands/mod.rs`**

```rust
pub mod ai;
```

**文件 7: `src-tauri/src/main.rs`**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai;
mod commands;

use std::sync::Arc;
use ai::{AIService, AIConfig};

fn main() {
    let ai_config = AIConfig::default();
    let ai_service = Arc::new(AIService::new(ai_config));

    tauri::Builder::default()
        .manage(ai_service)
        .invoke_handler(tauri::generate_handler![
            commands::ai::load_ai_model,
            commands::ai::is_ai_model_loaded,
            commands::ai::ai_generate,
            commands::ai::ai_chat,
            commands::ai::ai_improve_text,
            commands::ai::ai_summarize_text,
            commands::ai::ai_translate_text,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 2.4 构建测试

```bash
cd src-tauri
cargo build

# 如果遇到错误，检查依赖是否正确安装
cargo clean
cargo build
```

---

### 阶段 3: TypeScript 前端实现（2-3 小时）

#### 3.1 创建 AI 服务

```bash
cd src
mkdir -p services/ai
touch services/ai/local-ai.ts
```

**文件: `src/services/ai/local-ai.ts`**

```typescript
import { invoke } from '@tauri-apps/api/core';

export interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LocalAIService {
  async loadModel(modelPath: string): Promise<void> {
    await invoke('load_ai_model', { modelPath });
  }

  async isModelLoaded(): Promise<boolean> {
    return await invoke('is_ai_model_loaded');
  }

  async generate(request: GenerateRequest): Promise<string> {
    return await invoke('ai_generate', { request });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return await invoke('ai_chat', { messages });
  }

  async improveText(text: string): Promise<string> {
    return await invoke('ai_improve_text', { text });
  }

  async summarizeText(text: string): Promise<string> {
    return await invoke('ai_summarize_text', { text });
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    return await invoke('ai_translate_text', { text, targetLang });
  }
}

export const localAI = new LocalAIService();
```

#### 3.2 创建 React Hook

**文件: `src/hooks/useLocalAI.ts`**

```typescript
import { useState, useEffect } from 'react';
import { localAI } from '../services/ai/local-ai';
import { log } from '../utils/logger';

export function useLocalAI() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const loaded = await localAI.isModelLoaded();
      setIsLoaded(loaded);
      log.info('useLocalAI', 'Model status checked', { loaded });
    } catch (err) {
      log.error('useLocalAI', 'Failed to check model status', err as Error);
    }
  };

  const loadModel = async (modelPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      log.info('useLocalAI', 'Loading model', { modelPath });
      await localAI.loadModel(modelPath);
      setIsLoaded(true);
      log.info('useLocalAI', 'Model loaded successfully');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      log.error('useLocalAI', 'Failed to load model', err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const improveText = async (text: string): Promise<string> {
    if (!isLoaded) throw new Error('Model not loaded');
    
    setIsLoading(true);
    try {
      const result = await localAI.improveText(text);
      log.info('useLocalAI', 'Text improved');
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeText = async (text: string): Promise<string> {
    if (!isLoaded) throw new Error('Model not loaded');
    
    setIsLoading(true);
    try {
      return await localAI.summarizeText(text);
    } finally {
      setIsLoading(false);
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> {
    if (!isLoaded) throw new Error('Model not loaded');
    
    setIsLoading(true);
    try {
      return await localAI.translateText(text, targetLang);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoaded,
    isLoading,
    error,
    loadModel,
    improveText,
    summarizeText,
    translateText,
  };
}
```

#### 3.3 创建 AI 设置组件

**文件: `src/components/AISettings.tsx`**

```typescript
import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useLocalAI } from '../hooks/useLocalAI';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AISettings({ onClose }: { onClose: () => void }) {
  const { isLoaded, isLoading, loadModel } = useLocalAI();
  const [modelPath, setModelPath] = useState('');

  const handleSelectModel = async () => {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'GGUF Model',
        extensions: ['gguf'],
      }],
    });

    if (selected) {
      setModelPath(selected as string);
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
    } catch (error) {
      alert(`模型加载失败: ${(error as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">本地 AI 设置</h2>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* 模型状态 */}
          <div>
            <label className="block text-sm font-medium mb-2">模型状态</label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded ${
              isLoaded ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {isLoaded ? (
                <>
                  <CheckCircle size={20} />
                  <span>已加载 - Qwen 3.5 9B</span>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span>未加载</span>
                </>
              )}
            </div>
          </div>

          {/* 模型路径 */}
          <div>
            <label className="block text-sm font-medium mb-2">模型文件</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
                placeholder="选择 GGUF 模型文件..."
                className="flex-1 px-3 py-2 rounded bg-background border border-border"
                readOnly
              />
              <button
                onClick={handleSelectModel}
                className="px-4 py-2 rounded bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                浏览
              </button>
            </div>
          </div>

          {/* 加载按钮 */}
          <button
            onClick={handleLoadModel}
            disabled={isLoading || !modelPath || isLoaded}
            className="w-full px-4 py-3 rounded bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>加载中...</span>
              </>
            ) : isLoaded ? (
              <span>已加载</span>
            ) : (
              <span>加载模型</span>
            )}
          </button>

          {/* 信息提示 */}
          <div className="bg-background/50 rounded p-4 text-sm space-y-2">
            <p className="font-medium">推荐配置:</p>
            <ul className="space-y-1 text-foreground/70">
              <li>• 模型: Qwen 2.5 9B Instruct (Q4_K_M)</li>
              <li>• 内存需求: ~6GB RAM</li>
              <li>• 推理速度: ~10-20 tokens/s (CPU)</li>
              <li>• 文件大小: ~5.5GB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 3.4 创建 AI 按钮组件

**文件: `src/components/LocalAIButton.tsx`**

```typescript
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useLocalAI } from '../hooks/useLocalAI';

interface LocalAIButtonProps {
  selectedText: string;
  onReplace: (text: string) => void;
}

export default function LocalAIButton({ selectedText, onReplace }: LocalAIButtonProps) {
  const { isLoaded, improveText } = useLocalAI();
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (!selectedText) {
      alert('请先选择文本');
      return;
    }

    if (!isLoaded) {
      alert('AI 模型未加载，请在设置中加载模型');
      return;
    }

    setProcessing(true);
    try {
      const improved = await improveText(selectedText);
      onReplace(improved);
    } catch (error) {
      alert(`AI 处理失败: ${(error as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded || processing}
      className="p-1 hover:bg-accent/10 rounded disabled:opacity-50 transition-colors"
      title={isLoaded ? 'AI 改写 (本地 Qwen 3.5)' : 'AI 模型未加载'}
    >
      {processing ? (
        <Loader2 size={16} className="animate-spin text-primary" />
      ) : (
        <Sparkles size={16} className={isLoaded ? 'text-primary' : 'text-gray-400'} />
      )}
    </button>
  );
}
```

---

### 阶段 4: 集成和测试（1-2 小时）

#### 4.1 添加到设置面板

在 `Settings.tsx` 中添加 AI 设置选项卡。

#### 4.2 添加到编辑器工具栏

在 `MarkdownToolbar.tsx` 中添加 LocalAIButton。

#### 4.3 测试流程

1. **启动应用**
   ```bash
   npm run tauri:dev
   ```

2. **加载模型**
   - 打开设置 → AI 设置
   - 选择 GGUF 模型文件
   - 点击"加载模型"
   - 等待加载完成（约 10-30 秒）

3. **测试 AI 功能**
   - 在编辑器中选择文本
   - 点击 AI 按钮
   - 等待生成结果
   - 验证文本被替换

---

## ✅ 验收清单

- [ ] Rust 后端编译成功
- [ ] 模型加载成功
- [ ] AI 改写功能正常
- [ ] AI 摘要功能正常
- [ ] AI 翻译功能正常
- [ ] 错误处理正常
- [ ] 性能可接受（10+ tokens/s）

---

## 🎯 总结

完整实施 Rust + llama.cpp 本地 AI 推理，实现：

✅ **完全本地** - 无需网络  
✅ **高性能** - Rust 原生速度  
✅ **低成本** - 无 API 费用  
✅ **完全隐私** - 数据不离开本地  
✅ **Tauri 原生** - 完美集成

**预计完成时间**: 2-3 天  
**难度**: ⭐⭐⭐⭐  
**价值**: ⭐⭐⭐⭐⭐
