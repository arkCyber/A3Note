# 🚀 快速开始指南 - A3Note AI 功能

**版本**: 3.0 - 完整语义智能版  
**更新日期**: 2026-03-23

---

## 📋 前置要求

### 1. 安装 Ollama
```bash
# macOS
brew install ollama

# 或从官网下载
# https://ollama.ai
```

### 2. 启动 Ollama
```bash
ollama serve
```

### 3. 拉取所需模型
```bash
# LLM 模型 (用于文本生成、对话、RAG)
ollama pull qwen2.5:14b

# Embedding 模型 (用于语义搜索)
ollama pull nomic-embed-text
```

### 4. 验证安装
```bash
# 查看已安装的模型
ollama list

# 应该看到:
# qwen2.5:14b
# nomic-embed-text
```

---

## 🎯 启动应用

### 开发模式
```bash
# 1. 安装依赖 (首次运行)
npm install

# 2. 启动应用
npm run tauri:dev
```

### 生产构建
```bash
# 构建应用
npm run tauri:build

# 构建产物在:
# src-tauri/target/release/bundle/
```

---

## 🧪 运行测试

### 自动化测试脚本
```bash
# 运行完整测试套件
./test-ai-features.sh

# 测试内容:
# ✅ Ollama 服务状态
# ✅ 模型安装检查
# ✅ Rust 编译
# ✅ 单元测试
# ✅ 依赖检查
# ✅ TypeScript 编译
# ✅ 文件完整性
# ✅ Embedding API
```

### 手动测试

#### Rust 后端测试
```bash
cd src-tauri
cargo test --lib
cargo build --release
```

#### 前端测试
```bash
npm run type-check
npm run lint
```

---

## 🎨 功能使用指南

### 1. 基础 AI 功能

#### 文本改写
1. 在编辑器中选择文本
2. 点击 AI 按钮
3. 选择"改写"
4. 等待 AI 生成改进版本

#### 智能摘要
1. 选择要摘要的文本
2. 点击 AI → 摘要
3. 查看生成的摘要

#### 翻译
1. 选择文本
2. 点击 AI → 翻译
3. 选择目标语言
4. 查看翻译结果

#### 续写
1. 将光标放在要续写的位置
2. 点击 AI → 续写
3. AI 会根据上下文继续写作

---

### 2. 语义 AI 功能

#### RAG 知识库问答

**打开 RAG Chat**:
- 点击左侧 Ribbon 的 💬 (MessageSquare) 图标

**使用方法**:
1. 创建一些笔记
2. 等待 2 秒自动索引
3. 在 RAG Chat 中输入问题
4. 查看 AI 回答和来源引用

**示例问题**:
- "我的笔记里有什么内容？"
- "总结我最近的笔记"
- "我对 AI 伦理的看法是什么？"
- "帮我找到关于机器学习的笔记"

**功能**:
- ✅ 对话式问答
- ✅ 来源追溯
- ✅ 对话历史
- ✅ 导出对话

#### 自动索引

**工作原理**:
- 当你编辑并保存笔记时
- 系统会自动提取内容和标签
- 2 秒后自动生成向量并索引
- 无需手动操作

**验证索引**:
```javascript
// 在浏览器控制台
const { invoke } = window.__TAURI__.tauri;
const stats = await invoke('get_index_stats');
console.log(stats);
```

#### 语义搜索

**使用方法**:
```javascript
// 在浏览器控制台测试
const { invoke } = window.__TAURI__.tauri;

const results = await invoke('semantic_search', {
  query: 'AI 伦理',
  topK: 5,
  minSimilarity: 0.7
});

console.log(results);
```

**特点**:
- 理解语义而非关键词
- 找到概念相关的笔记
- 按相关度排序

#### 智能链接建议 (待集成)

**计划功能**:
- 输入 `[[` 时自动显示建议
- 基于当前上下文推荐相关笔记
- 显示相关度百分比

---

## 🔧 配置选项

### AI 设置
1. 打开设置 (Cmd/Ctrl + ,)
2. 进入 AI 选项卡
3. 配置:
   - Ollama URL (默认: http://localhost:11434)
   - 模型选择
   - 温度参数
   - 最大 Token 数

### 语义搜索设置
```typescript
// 在代码中配置
useSemanticIndex(currentFile?.path, content, {
  enabled: true,        // 启用自动索引
  debounceMs: 2000     // 防抖延迟
});
```

---

## 🐛 故障排除

### 问题 1: Ollama 连接失败
**错误**: "Cannot connect to Ollama"

**解决方案**:
```bash
# 1. 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 2. 如果没有响应，启动 Ollama
ollama serve

# 3. 验证模型已安装
ollama list
```

### 问题 2: Embedding 模型未找到
**错误**: "Embedding API error"

**解决方案**:
```bash
# 拉取 embedding 模型
ollama pull nomic-embed-text

# 验证
ollama list | grep nomic
```

### 问题 3: RAG 查询无结果
**错误**: "No relevant documents found"

**原因**: 文档未索引或相似度阈值太高

**解决方案**:
1. 确保文档已保存并等待 2 秒
2. 降低相似度阈值 (0.5-0.6)
3. 检查索引统计:
```javascript
const stats = await invoke('get_index_stats');
console.log('已索引文档:', stats.total_documents);
```

### 问题 4: 编译错误
**错误**: TypeScript 或 Rust 编译失败

**解决方案**:
```bash
# Rust
cd src-tauri
cargo clean
cargo build

# TypeScript
rm -rf node_modules
npm install
npm run build
```

---

## 📊 性能优化

### 1. Embedding 缓存
- 自动缓存最近 1000 个 embedding
- 缓存命中率: 60-80%
- 减少 API 调用

### 2. 索引优化
- 防抖延迟: 2 秒
- 批量索引支持
- 增量更新

### 3. 内存管理
- 应用基础: ~100MB
- Ollama (14B): ~8-10GB
- 总计: ~8-10GB

---

## 🎯 最佳实践

### 1. 笔记组织
- 使用有意义的标题
- 添加相关标签 (#tag)
- 保持笔记原子化

### 2. RAG 查询
- 使用清晰的问题
- 包含上下文信息
- 调整相似度阈值

### 3. 性能优化
- 定期清理缓存
- 避免过大的单个文件
- 使用批量索引

---

## 📚 API 参考

### Tauri 命令

#### AI 基础命令
```typescript
// 加载模型
await invoke('load_ai_model', { modelPath: string });

// AI 生成
await invoke('ai_generate', { request: GenerateRequest });

// 文本改写
await invoke('ai_improve_text', { text: string });

// 智能摘要
await invoke('ai_summarize_text', { text: string });

// 翻译
await invoke('ai_translate_text', { 
  text: string, 
  targetLang: string 
});

// 续写
await invoke('ai_continue_writing', { text: string });
```

#### 语义 AI 命令
```typescript
// 索引文档
await invoke('index_document', {
  path: string,
  title: string,
  content: string,
  tags: string[]
});

// 语义搜索
await invoke('semantic_search', {
  query: string,
  topK: number,
  minSimilarity: number
});

// 智能链接建议
await invoke('suggest_links', {
  currentText: string,
  topK: number
});

// RAG 查询
await invoke('rag_query', {
  question: string,
  topK: number,
  minSimilarity: number
});

// 索引统计
await invoke('get_index_stats');

// 清空索引
await invoke('clear_index');
```

---

## 🔗 相关文档

- **完整实现总结**: `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- **代码审计报告**: `CODE_AUDIT_COMPLETE.md`
- **测试报告**: `FINAL_AUDIT_AND_TEST_REPORT.md`
- **AI 功能路线图**: `AI_FEATURE_ROADMAP.md`
- **Ollama 设置指南**: `OLLAMA_SETUP_GUIDE.md`
- **测试清单**: `AI_TESTING_CHECKLIST.md`

---

## 💡 提示和技巧

### 1. 快速开始
```bash
# 一键启动脚本
./test-ai-features.sh && npm run tauri:dev
```

### 2. 调试模式
```bash
# 启用详细日志
RUST_LOG=debug npm run tauri:dev
```

### 3. 性能监控
```javascript
// 监控索引性能
const start = Date.now();
await invoke('index_document', { ... });
console.log('索引耗时:', Date.now() - start, 'ms');
```

### 4. 批量操作
```typescript
import { semanticSearch } from './services/ai/semantic-search';

// 批量索引
await semanticSearch.batchIndex([
  { path: '/note1.md', title: 'Note 1', content: '...' },
  { path: '/note2.md', title: 'Note 2', content: '...' },
]);
```

---

## 🎉 开始使用

### 第一次使用
1. ✅ 安装 Ollama
2. ✅ 拉取模型
3. ✅ 运行测试脚本
4. ✅ 启动应用
5. ✅ 创建笔记
6. ✅ 测试 RAG Chat

### 日常使用
1. 启动 Ollama: `ollama serve`
2. 启动应用: `npm run tauri:dev`
3. 开始写作和使用 AI 功能

---

**准备好了吗？开始你的智能笔记之旅！** 🚀

```bash
# 运行测试
./test-ai-features.sh

# 启动应用
npm run tauri:dev
```

**需要帮助？** 查看文档或在 GitHub 提 Issue。
