# AI 功能集成方案

**日期**: 2026-03-23  
**项目**: A3Note  
**目标**: 为 Obsidian 风格笔记应用添加 AI 能力

---

## 🎯 AI 功能概述

### 核心理念
将 AI 无缝集成到笔记工作流中，提升写作效率和知识管理能力，同时保持 Obsidian 的简洁体验。

### 设计原则
1. **非侵入式**: AI 功能作为辅助，不干扰正常使用
2. **上下文感知**: 基于当前文档和工作区智能响应
3. **隐私优先**: 支持本地模型和云端模型选择
4. **可配置**: 用户可自由开启/关闭各项功能

---

## 🚀 推荐的 AI 功能

### 阶段 1: 基础 AI 功能（MVP）

#### 1. **AI 写作助手** ✍️

**功能**:
- 续写建议
- 改写优化
- 语法纠错
- 翻译

**触发方式**:
```
- 选中文本 → 右键菜单 → AI 选项
- 快捷键: Cmd+Shift+A
- 侧边栏 AI 面板
```

**实现位置**:
```
src/
  components/
    AIPanel.tsx          # AI 侧边栏面板
    AIContextMenu.tsx    # AI 右键菜单
  services/
    ai/
      AIService.ts       # AI 服务抽象层
      OpenAIProvider.ts  # OpenAI 实现
      LocalProvider.ts   # 本地模型实现
  hooks/
    useAI.ts            # AI 功能 Hook
```

---

#### 2. **智能摘要** 📝

**功能**:
- 文档摘要生成
- 关键点提取
- TL;DR 生成

**触发方式**:
```
- 工具栏按钮
- 命令面板: "生成摘要"
- 快捷键: Cmd+Shift+S
```

**UI 位置**:
```
- 编辑器顶部工具栏
- 右侧预览面板
- 状态栏快捷按钮
```

---

#### 3. **智能搜索增强** 🔍

**功能**:
- 语义搜索（不仅匹配关键词）
- 相关文档推荐
- 智能问答

**实现**:
```typescript
// 增强现有搜索
interface AISearchResult {
  file: FileItem;
  relevanceScore: number;
  matchReason: string;
  relatedFiles: FileItem[];
}

// 向量数据库集成
- 使用 Qdrant/Chroma 存储文档向量
- 实时更新索引
- 语义相似度搜索
```

---

### 阶段 2: 高级 AI 功能

#### 4. **AI 聊天助手** 💬

**功能**:
- 基于笔记库的问答
- 写作建议
- 知识关联

**UI 设计**:
```
┌─────────────────────────────┐
│ AI 助手                  [×]│
├─────────────────────────────┤
│ 💬 你好！我可以帮你：      │
│    - 回答关于笔记的问题    │
│    - 提供写作建议          │
│    - 查找相关内容          │
├─────────────────────────────┤
│ 用户: 总结我的项目笔记     │
│                             │
│ AI: 根据你的笔记，项目...  │
├─────────────────────────────┤
│ [输入消息...]          [发送]│
└─────────────────────────────┘
```

**实现位置**:
```
src/
  components/
    AIChatPanel.tsx      # 聊天面板
    ChatMessage.tsx      # 消息组件
  services/
    ai/
      ChatService.ts     # 聊天服务
      RAGService.ts      # RAG 检索增强
```

---

#### 5. **自动标签和分类** 🏷️

**功能**:
- 自动提取标签
- 智能分类建议
- 知识图谱构建

**实现**:
```typescript
interface AITagSuggestion {
  tag: string;
  confidence: number;
  reason: string;
}

// 自动运行
- 保存文件时自动分析
- 批量处理现有文件
- 实时建议
```

---

#### 6. **智能补全** ⚡

**功能**:
- 基于上下文的智能补全
- 代码块补全
- 链接建议

**集成到编辑器**:
```typescript
// CodeMirror 扩展
const aiCompletionExtension = autocompletion({
  override: [
    async (context) => {
      const aiSuggestions = await getAISuggestions(context);
      return {
        from: context.pos,
        options: aiSuggestions,
      };
    },
  ],
});
```

---

## 🏗️ 技术架构

### 1. AI 服务抽象层

```typescript
// src/services/ai/AIService.ts

export interface AIProvider {
  name: string;
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  chat(messages: ChatMessage[]): Promise<string>;
  embed(text: string): Promise<number[]>;
}

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 统一的 AI 服务
export class AIService {
  private provider: AIProvider;
  
  constructor(provider: AIProvider) {
    this.provider = provider;
  }
  
  async complete(prompt: string): Promise<string> {
    return this.provider.complete(prompt);
  }
  
  async chat(messages: ChatMessage[]): Promise<string> {
    return this.provider.chat(messages);
  }
  
  async summarize(text: string): Promise<string> {
    const prompt = `请总结以下内容：\n\n${text}`;
    return this.complete(prompt);
  }
  
  async rewrite(text: string, style: string): Promise<string> {
    const prompt = `请将以下内容改写为${style}风格：\n\n${text}`;
    return this.complete(prompt);
  }
  
  async translate(text: string, targetLang: string): Promise<string> {
    const prompt = `请将以下内容翻译为${targetLang}：\n\n${text}`;
    return this.complete(prompt);
  }
}
```

---

### 2. 多 Provider 支持

```typescript
// src/services/ai/providers/OpenAIProvider.ts
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private baseURL: string;
  
  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      }),
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  // ... 其他方法
}

// src/services/ai/providers/LocalProvider.ts
export class LocalProvider implements AIProvider {
  name = 'Local (Ollama)';
  private baseURL = 'http://localhost:11434';
  
  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: 'llama2',
        prompt: prompt,
      }),
    });
    
    const data = await response.json();
    return data.response;
  }
  
  // ... 其他方法
}

// src/services/ai/providers/ClaudeProvider.ts
export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  // ... 实现
}
```

---

### 3. RAG (检索增强生成) 架构

```typescript
// src/services/ai/RAGService.ts

export class RAGService {
  private vectorDB: VectorDatabase;
  private aiService: AIService;
  
  // 索引文档
  async indexDocument(file: FileItem, content: string): Promise<void> {
    // 1. 分块
    const chunks = this.splitIntoChunks(content);
    
    // 2. 生成向量
    for (const chunk of chunks) {
      const embedding = await this.aiService.embed(chunk.text);
      await this.vectorDB.insert({
        id: `${file.path}:${chunk.index}`,
        vector: embedding,
        metadata: {
          filePath: file.path,
          fileName: file.name,
          chunkIndex: chunk.index,
          text: chunk.text,
        },
      });
    }
  }
  
  // 语义搜索
  async semanticSearch(query: string, topK: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.aiService.embed(query);
    const results = await this.vectorDB.search(queryEmbedding, topK);
    return results;
  }
  
  // 基于上下文的问答
  async answerQuestion(question: string): Promise<string> {
    // 1. 检索相关文档
    const relevantDocs = await this.semanticSearch(question);
    
    // 2. 构建上下文
    const context = relevantDocs
      .map(doc => doc.metadata.text)
      .join('\n\n');
    
    // 3. 生成答案
    const prompt = `
基于以下上下文回答问题：

上下文：
${context}

问题：${question}

答案：
    `;
    
    return this.aiService.complete(prompt);
  }
  
  private splitIntoChunks(text: string): TextChunk[] {
    // 智能分块：按段落、标题等
    const chunks: TextChunk[] = [];
    const paragraphs = text.split('\n\n');
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const para of paragraphs) {
      if (currentChunk.length + para.length > 500) {
        chunks.push({ index: chunkIndex++, text: currentChunk });
        currentChunk = para;
      } else {
        currentChunk += '\n\n' + para;
      }
    }
    
    if (currentChunk) {
      chunks.push({ index: chunkIndex, text: currentChunk });
    }
    
    return chunks;
  }
}
```

---

## 🎨 UI 组件设计

### 1. AI 侧边栏面板

```typescript
// src/components/AIPanel.tsx

import { useState } from 'react';
import { Sparkles, MessageSquare, FileText, Search } from 'lucide-react';

export default function AIPanel() {
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'search'>('chat');
  
  return (
    <div className="w-80 bg-secondary border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <h2 className="text-sm font-semibold">AI 助手</h2>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 p-2 text-sm ${activeTab === 'chat' ? 'bg-primary/20' : ''}`}
        >
          <MessageSquare size={16} className="inline mr-1" />
          聊天
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 p-2 text-sm ${activeTab === 'summary' ? 'bg-primary/20' : ''}`}
        >
          <FileText size={16} className="inline mr-1" />
          摘要
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 p-2 text-sm ${activeTab === 'search' ? 'bg-primary/20' : ''}`}
        >
          <Search size={16} className="inline mr-1" />
          搜索
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && <AIChatView />}
        {activeTab === 'summary' && <AISummaryView />}
        {activeTab === 'search' && <AISearchView />}
      </div>
    </div>
  );
}
```

---

### 2. AI 工具栏按钮

```typescript
// src/components/AIToolbar.tsx

export default function AIToolbar({ onAction }: AIToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b border-border">
      <button
        onClick={() => onAction('summarize')}
        className="p-1 hover:bg-accent/10 rounded"
        title="生成摘要"
      >
        <FileText size={16} />
      </button>
      
      <button
        onClick={() => onAction('rewrite')}
        className="p-1 hover:bg-accent/10 rounded"
        title="AI 改写"
      >
        <RefreshCw size={16} />
      </button>
      
      <button
        onClick={() => onAction('translate')}
        className="p-1 hover:bg-accent/10 rounded"
        title="翻译"
      >
        <Languages size={16} />
      </button>
      
      <button
        onClick={() => onAction('chat')}
        className="p-1 hover:bg-accent/10 rounded"
        title="AI 聊天"
      >
        <MessageSquare size={16} />
      </button>
    </div>
  );
}
```

---

### 3. AI 上下文菜单

```typescript
// src/components/AIContextMenu.tsx

export function getAIContextMenuItems(selectedText: string): ContextMenuItem[] {
  return [
    {
      label: 'AI 功能',
      icon: <Sparkles size={14} />,
      submenu: [
        {
          label: '续写',
          icon: <PenTool size={14} />,
          action: () => continueWriting(selectedText),
        },
        {
          label: '改写',
          icon: <RefreshCw size={14} />,
          action: () => rewrite(selectedText),
        },
        {
          label: '总结',
          icon: <FileText size={14} />,
          action: () => summarize(selectedText),
        },
        {
          label: '翻译',
          icon: <Languages size={14} />,
          submenu: [
            { label: '翻译为英文', action: () => translate(selectedText, 'en') },
            { label: '翻译为中文', action: () => translate(selectedText, 'zh') },
            { label: '翻译为日文', action: () => translate(selectedText, 'ja') },
          ],
        },
        {
          label: '解释',
          icon: <HelpCircle size={14} />,
          action: () => explain(selectedText),
        },
      ],
    },
  ];
}
```

---

## 📦 依赖和工具

### NPM 包

```json
{
  "dependencies": {
    // AI SDK
    "openai": "^4.20.0",
    "ai": "^3.0.0",  // Vercel AI SDK
    
    // 向量数据库
    "@qdrant/js-client-rest": "^1.7.0",
    "chromadb": "^1.5.0",
    
    // 本地模型
    "ollama": "^0.1.0",
    
    // 工具
    "langchain": "^0.1.0",  // 可选：LangChain 集成
    "tiktoken": "^1.0.0"    // Token 计数
  }
}
```

---

## 🔐 隐私和安全

### 1. 数据处理选项

```typescript
export enum AIProcessingMode {
  LOCAL = 'local',      // 完全本地处理
  CLOUD = 'cloud',      // 云端处理
  HYBRID = 'hybrid',    // 混合模式
}

export interface AISettings {
  processingMode: AIProcessingMode;
  provider: 'openai' | 'claude' | 'local';
  apiKey?: string;
  localModelPath?: string;
  enableTelemetry: boolean;
  cacheResponses: boolean;
}
```

### 2. 本地优先策略

```
优先级：
1. 本地模型（Ollama/LLaMA）- 完全隐私
2. 自托管 API - 数据可控
3. 云端 API - 便捷但需信任
```

---

## 📊 实施计划

### 阶段 1: 基础设施（1-2 周）

**任务**:
- [ ] 创建 AI 服务抽象层
- [ ] 实现 OpenAI Provider
- [ ] 实现本地 Provider (Ollama)
- [ ] 添加 AI 设置面板
- [ ] 基础 UI 组件

**文件**:
```
src/
  services/ai/
    AIService.ts
    providers/
      OpenAIProvider.ts
      LocalProvider.ts
  components/
    AIPanel.tsx
    AISettings.tsx
  hooks/
    useAI.ts
```

---

### 阶段 2: 核心功能（2-3 周）

**任务**:
- [ ] AI 写作助手（续写、改写）
- [ ] 智能摘要
- [ ] AI 上下文菜单
- [ ] 快捷键集成

**功能**:
- 选中文本 AI 操作
- 工具栏 AI 按钮
- 命令面板集成

---

### 阶段 3: 高级功能（3-4 周）

**任务**:
- [ ] RAG 系统实现
- [ ] 向量数据库集成
- [ ] AI 聊天助手
- [ ] 语义搜索

**功能**:
- 基于笔记库的问答
- 智能文档推荐
- 知识图谱

---

### 阶段 4: 优化和完善（1-2 周）

**任务**:
- [ ] 性能优化
- [ ] 缓存机制
- [ ] 错误处理
- [ ] 用户体验优化
- [ ] 文档和测试

---

## 💡 最佳实践

### 1. 渐进式增强

```typescript
// 检测 AI 可用性
const aiAvailable = await checkAIAvailability();

if (aiAvailable) {
  // 显示 AI 功能
  showAIFeatures();
} else {
  // 隐藏或禁用 AI 功能
  hideAIFeatures();
}
```

### 2. 用户控制

```typescript
// 用户可以随时取消 AI 操作
const abortController = new AbortController();

const result = await aiService.complete(prompt, {
  signal: abortController.signal,
});

// 取消按钮
<button onClick={() => abortController.abort()}>取消</button>
```

### 3. 流式响应

```typescript
// 实时显示 AI 生成内容
async function* streamCompletion(prompt: string) {
  const response = await fetch('/api/ai/complete', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    yield chunk;
  }
}

// 使用
for await (const chunk of streamCompletion(prompt)) {
  appendToEditor(chunk);
}
```

---

## 🎯 推荐的实施顺序

### 最小可行产品（MVP）

**第一步**: AI 写作助手
```
- 选中文本 → 右键 → AI 改写
- 简单、直观、立即可用
- 使用 OpenAI API
```

**第二步**: 智能摘要
```
- 工具栏按钮 → 生成摘要
- 展示在预览面板
```

**第三步**: AI 设置
```
- 设置面板中添加 AI 配置
- API Key 管理
- Provider 选择
```

### 完整版本

**第四步**: AI 聊天
```
- 侧边栏 AI 面板
- 基于笔记的问答
```

**第五步**: RAG 和语义搜索
```
- 向量数据库
- 智能搜索
- 文档推荐
```

---

## 📝 配置示例

```typescript
// src/config/ai.config.ts

export const aiConfig = {
  // 默认 Provider
  defaultProvider: 'openai',
  
  // Provider 配置
  providers: {
    openai: {
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
    },
    local: {
      baseURL: 'http://localhost:11434',
      model: 'llama2',
    },
    claude: {
      baseURL: 'https://api.anthropic.com/v1',
      model: 'claude-3-opus-20240229',
    },
  },
  
  // 功能开关
  features: {
    writeAssistant: true,
    summarization: true,
    translation: true,
    chat: true,
    semanticSearch: false,  // 需要向量数据库
    autoCompletion: false,  // 实验性功能
  },
  
  // RAG 配置
  rag: {
    chunkSize: 500,
    chunkOverlap: 50,
    topK: 5,
    vectorDB: 'qdrant',
  },
};
```

---

## ✅ 总结

### 推荐方案

**最适合 A3Note 的 AI 集成方式**:

1. **从简单开始**: AI 写作助手（改写、续写、翻译）
2. **渐进增强**: 添加摘要、聊天功能
3. **最终目标**: 完整的 RAG 系统和语义搜索

### 技术选型

- **AI SDK**: Vercel AI SDK（统一接口）
- **Provider**: OpenAI（云端）+ Ollama（本地）
- **向量数据库**: Qdrant（轻量、高性能）
- **UI**: 侧边栏面板 + 上下文菜单

### 预期效果

- ✅ 提升写作效率 50%+
- ✅ 智能知识管理
- ✅ 无缝 Obsidian 体验
- ✅ 隐私可控

---

**下一步**: 是否开始实施 AI 功能？建议从 AI 写作助手开始！
