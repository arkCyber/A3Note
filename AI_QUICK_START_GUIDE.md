# AI 功能快速启动指南

**项目**: A3Note  
**目标**: 最快速度添加实用的 AI 功能

---

## 🚀 最简单的开始方式

### 方案 A: 使用 Vercel AI SDK（推荐）

**优势**:
- 统一接口，支持多个 AI Provider
- 流式响应开箱即用
- React Hooks 集成
- 类型安全

**安装**:
```bash
npm install ai openai
```

**最小实现**（5 分钟）:

```typescript
// src/hooks/useAI.ts
import { useChat } from 'ai/react';

export function useAI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
}
```

```typescript
// src/components/AIChat.tsx
import { useAI } from '../hooks/useAI';

export default function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAI();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="inline-block p-2 rounded bg-secondary">
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="问我任何问题..."
          className="w-full p-2 rounded bg-background"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

---

### 方案 B: 直接使用 OpenAI SDK

**优势**:
- 完全控制
- 更多自定义选项
- 无需额外依赖

**安装**:
```bash
npm install openai
```

**实现**:

```typescript
// src/services/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 仅用于开发
});

export async function improveText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的写作助手，帮助改进文本质量。',
      },
      {
        role: 'user',
        content: `请改进以下文本：\n\n${text}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}

export async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的摘要助手。',
      },
      {
        role: 'user',
        content: `请总结以下内容：\n\n${text}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `请将以下内容翻译为${targetLang}：\n\n${text}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}
```

---

## 🎯 第一个功能：AI 改写按钮

**最简单、最实用的功能**

### 1. 添加 UI 按钮

```typescript
// 在 Editor.tsx 或 MarkdownToolbar.tsx 中添加
import { Sparkles } from 'lucide-react';

<button
  onClick={handleAIImprove}
  className="p-1 hover:bg-accent/10 rounded"
  title="AI 改写"
>
  <Sparkles size={16} />
</button>
```

### 2. 实现处理函数

```typescript
const handleAIImprove = async () => {
  // 获取选中的文本
  const selectedText = getSelectedText();
  
  if (!selectedText) {
    alert('请先选择要改写的文本');
    return;
  }
  
  try {
    // 显示加载状态
    setIsAIProcessing(true);
    
    // 调用 AI
    const improvedText = await improveText(selectedText);
    
    // 替换文本
    replaceSelectedText(improvedText);
    
  } catch (error) {
    console.error('AI 处理失败:', error);
    alert('AI 处理失败，请重试');
  } finally {
    setIsAIProcessing(false);
  }
};
```

### 3. 集成到编辑器

```typescript
// 在 Editor.tsx 中
const [isAIProcessing, setIsAIProcessing] = useState(false);

// 获取选中文本
const getSelectedText = () => {
  if (!editorView) return '';
  const { from, to } = editorView.state.selection.main;
  return editorView.state.doc.sliceString(from, to);
};

// 替换选中文本
const replaceSelectedText = (newText: string) => {
  if (!editorView) return;
  const { from, to } = editorView.state.selection.main;
  editorView.dispatch({
    changes: { from, to, insert: newText },
  });
};
```

---

## 🔑 API Key 管理

### 开发环境

```bash
# .env.local
VITE_OPENAI_API_KEY=sk-...
```

```typescript
// src/config/ai.ts
export const AI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
};
```

### 生产环境（Tauri）

```typescript
// 使用 Tauri 的安全存储
import { Store } from '@tauri-apps/plugin-store';

const store = new Store('.settings.dat');

// 保存 API Key
await store.set('openai_api_key', apiKey);

// 读取 API Key
const apiKey = await store.get('openai_api_key');
```

---

## 📦 完整的最小实现

### 文件结构

```
src/
  services/
    ai/
      openai.ts          # OpenAI 服务
      types.ts           # 类型定义
  hooks/
    useAI.ts            # AI Hook
  components/
    AIButton.tsx        # AI 按钮组件
    AIPanel.tsx         # AI 侧边栏（可选）
  config/
    ai.ts              # AI 配置
```

### 核心代码

```typescript
// src/services/ai/openai.ts
import OpenAI from 'openai';
import { AI_CONFIG } from '../../config/ai';

const openai = new OpenAI({
  apiKey: AI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true,
});

export const aiService = {
  async improve(text: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是写作助手' },
        { role: 'user', content: `改进：${text}` },
      ],
    });
    return response.choices[0].message.content;
  },

  async summarize(text: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `总结：${text}` },
      ],
    });
    return response.choices[0].message.content;
  },

  async translate(text: string, lang: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `翻译为${lang}：${text}` },
      ],
    });
    return response.choices[0].message.content;
  },
};
```

```typescript
// src/hooks/useAI.ts
import { useState } from 'react';
import { aiService } from '../services/ai/openai';

export function useAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const improve = async (text: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await aiService.improve(text);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const summarize = async (text: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await aiService.summarize(text);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    improve,
    summarize,
    isProcessing,
    error,
  };
}
```

```typescript
// src/components/AIButton.tsx
import { Sparkles } from 'lucide-react';
import { useAI } from '../hooks/useAI';

interface AIButtonProps {
  selectedText: string;
  onReplace: (text: string) => void;
}

export default function AIButton({ selectedText, onReplace }: AIButtonProps) {
  const { improve, isProcessing } = useAI();

  const handleClick = async () => {
    if (!selectedText) {
      alert('请先选择文本');
      return;
    }

    try {
      const result = await improve(selectedText);
      if (result) {
        onReplace(result);
      }
    } catch (error) {
      alert('AI 处理失败');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className="p-1 hover:bg-accent/10 rounded disabled:opacity-50"
      title="AI 改写"
    >
      <Sparkles size={16} className={isProcessing ? 'animate-spin' : ''} />
    </button>
  );
}
```

---

## 🎨 UI 集成位置

### 1. 编辑器工具栏（推荐）

```typescript
// 在 MarkdownToolbar.tsx 中
<AIButton
  selectedText={getSelectedText()}
  onReplace={replaceSelectedText}
/>
```

### 2. 右键菜单

```typescript
// 在 ContextMenu 中添加
{
  label: 'AI 改写',
  icon: <Sparkles size={14} />,
  action: () => handleAIImprove(),
}
```

### 3. 命令面板

```typescript
// 在 commands 数组中添加
{
  id: 'ai-improve',
  label: 'AI: 改写选中文本',
  action: handleAIImprove,
  shortcut: 'Cmd+Shift+A',
}
```

---

## 💰 成本估算

### OpenAI API 定价（2024）

| 模型 | 输入 | 输出 | 适用场景 |
|------|------|------|----------|
| GPT-3.5-turbo | $0.0005/1K tokens | $0.0015/1K tokens | 日常使用 |
| GPT-4 | $0.03/1K tokens | $0.06/1K tokens | 高质量需求 |

**估算**:
- 改写 500 字 ≈ 1000 tokens ≈ $0.002
- 每天使用 50 次 ≈ $0.10
- 每月 ≈ $3

---

## 🔒 安全建议

### 1. 不要在前端暴露 API Key

**错误**:
```typescript
// ❌ 不要这样做
const apiKey = 'sk-...';
```

**正确**:
```typescript
// ✅ 使用环境变量
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// ✅ 或使用后端代理
fetch('/api/ai/improve', {
  method: 'POST',
  body: JSON.stringify({ text }),
});
```

### 2. 使用 Tauri 安全存储

```typescript
import { Store } from '@tauri-apps/plugin-store';

const store = new Store('.settings.dat');
await store.set('api_key', encryptedKey);
```

---

## 📝 测试清单

### 基础功能
- [ ] AI 按钮显示正确
- [ ] 选中文本后点击按钮
- [ ] 显示加载状态
- [ ] 文本被正确替换
- [ ] 错误处理正常

### 边界情况
- [ ] 未选中文本时提示
- [ ] API Key 无效时提示
- [ ] 网络错误时提示
- [ ] 超长文本处理

---

## 🚀 下一步扩展

### 1. 添加更多 AI 功能

```typescript
// 续写
async continueWriting(text: string): Promise<string>

// 语法纠错
async fixGrammar(text: string): Promise<string>

// 扩写
async expand(text: string): Promise<string>

// 缩写
async condense(text: string): Promise<string>
```

### 2. 添加 AI 侧边栏

```typescript
<AIPanel
  onImprove={handleImprove}
  onSummarize={handleSummarize}
  onTranslate={handleTranslate}
/>
```

### 3. 添加流式响应

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [...],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  appendToEditor(content);
}
```

---

## ✅ 总结

### 最快开始方式

1. **安装依赖**: `npm install openai`
2. **添加 API Key**: `.env.local`
3. **创建服务**: `src/services/ai/openai.ts`
4. **添加按钮**: 工具栏 AI 按钮
5. **测试**: 选中文本 → 点击按钮

### 预期时间

- **最小实现**: 30 分钟
- **完整功能**: 2-3 小时
- **高级功能**: 1-2 天

### 推荐顺序

1. ✅ AI 改写按钮（最简单）
2. ✅ AI 摘要功能
3. ✅ AI 翻译功能
4. ⏳ AI 聊天面板
5. ⏳ 语义搜索

---

**准备好开始了吗？从 AI 改写按钮开始！** 🚀
