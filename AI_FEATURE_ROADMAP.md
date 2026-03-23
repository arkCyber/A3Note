# 🧠 AI 功能路线图 - 基于谷歌建议

**日期**: 2026-03-23  
**标准**: 航空航天级  
**架构**: 纯本地化，隐私优先

---

## 📊 谷歌建议评估

### ✅ 非常合适的建议

#### 1. **语义化动态关联** (优先级: P0)
**评估**: ⭐⭐⭐⭐⭐ 完美契合

**为什么合适**:
- 符合 Obsidian 核心理念（双链笔记）
- 利用我们已有的 Markdown 解析能力
- 可以基于现有的文件系统架构
- 用户价值极高

**技术可行性**:
- ✅ 使用 Ollama + Embedding 模型
- ✅ 本地向量数据库（Tantivy 已集成）
- ✅ 实时语义搜索
- ✅ 完全离线工作

**实现复杂度**: 中等（2-3 周）

#### 2. **基于全库的检索增强 (RAG)** (优先级: P0)
**评估**: ⭐⭐⭐⭐⭐ 核心功能

**为什么合适**:
- 这是 AI 笔记软件的"杀手级"功能
- 我们已有 Ollama 集成基础
- 完全本地化，符合隐私要求
- 可以复用现有的搜索索引

**技术可行性**:
- ✅ Ollama 支持 Embedding API
- ✅ Tantivy 支持向量搜索
- ✅ 已有文件监控系统
- ✅ 可以增量更新索引

**实现复杂度**: 中高（3-4 周）

#### 3. **极致的隐私与本地化** (优先级: P0)
**评估**: ⭐⭐⭐⭐⭐ 完全符合

**为什么合适**:
- **我们已经实现了这个！**
- Ollama 本地推理
- 无外部 API 调用
- 数据完全本地存储

**当前状态**: ✅ 已完成
- Ollama 集成
- 本地模型推理
- 无数据泄漏

#### 4. **自动化笔记维护与重构** (优先级: P1)
**评估**: ⭐⭐⭐⭐ 很有价值

**为什么合适**:
- 减少用户手动维护负担
- 提升笔记质量
- 可以利用 AI 理解能力

**技术可行性**:
- ✅ 自动标签提取（简单）
- ✅ YAML 前置配置生成（简单）
- ⚠️ 长文切片（需要精细设计）
- ⚠️ 内容健康度检查（需要复杂逻辑）

**实现复杂度**: 中等（2-3 周）

#### 5. **协作与工作流自动化** (优先级: P2)
**评估**: ⭐⭐⭐ 有价值但非核心

**为什么合适**:
- 提升工作效率
- 个性化体验

**为什么不是优先级**:
- 需要学习用户习惯（需要数据积累）
- 实现复杂度高
- 可能影响性能

**实现复杂度**: 高（4-6 周）

---

## 🎯 推荐实施路线图

### 阶段 1: 核心 AI 能力 (2-3 周) - 当前阶段

**目标**: 建立坚实的 AI 基础设施

#### 1.1 Embedding 系统 ✅ 部分完成
```
[✅] Ollama 集成
[⏳] Embedding API 调用
[⏳] 向量存储
[⏳] 相似度计算
```

**技术栈**:
- Ollama Embedding API (`/api/embeddings`)
- 向量数据库（考虑 Qdrant 或 Tantivy 扩展）
- 余弦相似度计算

**实现**:
```rust
// src-tauri/src/ai/embedding.rs
pub struct EmbeddingService {
    ollama_url: String,
    model: String, // "nomic-embed-text"
}

impl EmbeddingService {
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>> {
        // 调用 Ollama Embedding API
    }
    
    pub fn similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        // 余弦相似度
    }
}
```

#### 1.2 向量索引系统 (新增)
```
[⏳] 文件内容向量化
[⏳] 增量索引更新
[⏳] 向量搜索接口
[⏳] 缓存机制
```

**数据结构**:
```rust
pub struct VectorIndex {
    embeddings: HashMap<PathBuf, Vec<f32>>,
    metadata: HashMap<PathBuf, FileMetadata>,
}

pub struct FileMetadata {
    title: String,
    tags: Vec<String>,
    links: Vec<String>,
    modified: SystemTime,
}
```

---

### 阶段 2: 智能关联 (1-2 周)

**目标**: 实现语义化双链建议

#### 2.1 智能链接建议
```
功能: 用户输入时，实时推荐相关笔记
触发: 输入 [[ 或特定关键词
显示: 下拉列表，按相关度排序
```

**实现**:
```typescript
// src/services/ai/semantic-linking.ts
export class SemanticLinkingService {
  async suggestLinks(currentText: string): Promise<LinkSuggestion[]> {
    // 1. 提取当前段落
    // 2. 计算 embedding
    // 3. 搜索相似笔记
    // 4. 返回建议（带相关度分数）
  }
}
```

**UI 设计**:
```
输入: "今天学习了机器学习中的[[
建议:
  📄 神经网络基础 (相关度: 0.92)
  📄 深度学习概述 (相关度: 0.87)
  📄 AI 伦理讨论 (相关度: 0.65)
```

#### 2.2 知识地图聚类
```
功能: Graph View 中的语义聚类
显示: 自动标注簇群主题
交互: 点击簇群查看相关笔记
```

**实现**:
```rust
// src-tauri/src/ai/clustering.rs
pub fn cluster_notes(
    embeddings: &HashMap<PathBuf, Vec<f32>>,
    num_clusters: usize,
) -> Vec<Cluster> {
    // K-means 或 HDBSCAN 聚类
}

pub fn name_cluster(
    cluster: &Cluster,
    notes: &[Note],
) -> String {
    // 使用 AI 为簇群命名
}
```

---

### 阶段 3: RAG 知识库助手 (2-3 周)

**目标**: 实现"对话你的笔记"功能

#### 3.1 RAG 架构
```
用户提问
    ↓
向量检索（找到相关笔记）
    ↓
上下文构建（组装提示词）
    ↓
Ollama 生成回答
    ↓
返回答案 + 引用来源
```

**实现**:
```rust
// src-tauri/src/ai/rag.rs
pub struct RAGService {
    embedding_service: EmbeddingService,
    vector_index: VectorIndex,
    llm_service: AIService,
}

impl RAGService {
    pub async fn query(&self, question: &str) -> RAGResponse {
        // 1. 向量检索 top-k 相关笔记
        let relevant_notes = self.retrieve(question, 5).await?;
        
        // 2. 构建上下文
        let context = self.build_context(&relevant_notes);
        
        // 3. 生成回答
        let answer = self.llm_service.generate_with_context(
            question,
            &context
        ).await?;
        
        // 4. 返回答案 + 来源
        RAGResponse {
            answer,
            sources: relevant_notes,
        }
    }
}
```

#### 3.2 UI 设计
```
┌─────────────────────────────────────┐
│ 💬 问你的笔记库                      │
├─────────────────────────────────────┤
│ 问题: 我对自由意志的看法是什么？     │
│                                     │
│ 🤖 回答:                            │
│ 根据你的笔记，你认为自由意志...     │
│                                     │
│ 📚 来源:                            │
│ • 哲学思考.md (相关度: 0.95)        │
│ • 读书笔记-自由意志.md (0.88)       │
│ • 伦理学讨论.md (0.76)              │
└─────────────────────────────────────┘
```

---

### 阶段 4: 自动化维护 (2-3 周)

**目标**: 减少手动维护工作

#### 4.1 自动标签提取
```
功能: 分析笔记内容，自动添加标签
触发: 文件保存时
显示: 建议标签，用户确认
```

**实现**:
```rust
pub async fn extract_tags(content: &str) -> Vec<String> {
    let prompt = format!(
        "分析以下笔记，提取 3-5 个关键标签：\n\n{}",
        content
    );
    
    let response = ollama.generate(prompt).await?;
    parse_tags(&response.text)
}
```

#### 4.2 YAML 前置配置生成
```
功能: 自动生成/更新 YAML frontmatter
内容: tags, category, summary, created, modified
```

**示例**:
```markdown
---
title: 机器学习笔记
tags: [AI, 机器学习, 深度学习]
category: 技术
summary: 介绍了神经网络的基本原理
created: 2026-03-20
modified: 2026-03-23
---

# 机器学习笔记
...
```

#### 4.3 长文原子化切片
```
功能: 将长笔记拆分为多个原子笔记
策略: 按主题、按章节、按概念
保持: 父子链接关系
```

**实现**:
```rust
pub async fn atomize_note(long_note: &str) -> Vec<AtomicNote> {
    // 1. AI 分析文章结构
    // 2. 识别独立主题
    // 3. 切分内容
    // 4. 建立链接
}
```

---

### 阶段 5: 高级功能 (3-4 周)

#### 5.1 多模态支持
```
[⏳] OCR 图片文字识别
[⏳] 手写草图转 Mermaid
[⏳] 图片语义搜索
```

#### 5.2 智能模板
```
[⏳] 学习用户习惯
[⏳] 生成个性化模板
[⏳] 自动填充字段
```

#### 5.3 网页剪藏增强
```
[⏳] 自动摘要
[⏳] 提取金句
[⏳] 关联已有笔记
```

---

## 🏗️ 技术架构设计

### 系统架构
```
┌─────────────────────────────────────────┐
│           React Frontend                │
│  ┌─────────────────────────────────┐   │
│  │  SemanticLinkingUI              │   │
│  │  RAGChatInterface               │   │
│  │  KnowledgeGraphView             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓ Tauri IPC
┌─────────────────────────────────────────┐
│           Rust Backend                  │
│  ┌─────────────────────────────────┐   │
│  │  EmbeddingService               │   │
│  │  VectorIndex                    │   │
│  │  RAGService                     │   │
│  │  ClusteringService              │   │
│  │  AutoTagService                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Ollama (本地)                      │
│  • LLM: qwen2.5:14b                    │
│  • Embedding: nomic-embed-text         │
└─────────────────────────────────────────┘
```

### 数据流
```
文件变更
    ↓
文件监控 (已有)
    ↓
提取内容 + 元数据
    ↓
生成 Embedding
    ↓
更新向量索引
    ↓
触发聚类更新
    ↓
UI 实时刷新
```

---

## 📊 优先级矩阵

| 功能 | 用户价值 | 技术难度 | 实现时间 | 优先级 |
|------|---------|---------|---------|--------|
| Embedding 系统 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 1 周 | P0 |
| 智能链接建议 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 1 周 | P0 |
| RAG 知识库助手 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 2-3 周 | P0 |
| 知识地图聚类 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 2 周 | P1 |
| 自动标签提取 | ⭐⭐⭐⭐ | ⭐⭐ | 1 周 | P1 |
| YAML 自动生成 | ⭐⭐⭐ | ⭐⭐ | 3 天 | P1 |
| 长文原子化 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 2 周 | P2 |
| 内容健康度检查 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 2 周 | P2 |
| 多模态支持 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 3-4 周 | P2 |
| 智能模板 | ⭐⭐ | ⭐⭐⭐⭐ | 2-3 周 | P3 |

---

## 🎯 第一阶段实施计划 (3-4 周)

### Week 1: Embedding 基础设施
```
Day 1-2: Ollama Embedding API 集成
Day 3-4: 向量存储设计与实现
Day 5-7: 文件内容向量化 + 增量更新
```

**交付物**:
- ✅ Embedding Service
- ✅ Vector Index
- ✅ 自动索引更新

### Week 2: 智能链接建议
```
Day 1-2: 相似度搜索算法
Day 3-4: 实时建议 UI
Day 5-7: 性能优化 + 测试
```

**交付物**:
- ✅ 智能链接建议功能
- ✅ 下拉建议 UI
- ✅ 性能达标（< 100ms）

### Week 3-4: RAG 知识库助手
```
Week 3:
  Day 1-3: RAG 检索逻辑
  Day 4-5: 上下文构建
  Day 6-7: LLM 集成

Week 4:
  Day 1-3: Chat UI 实现
  Day 4-5: 来源引用显示
  Day 6-7: 测试 + 优化
```

**交付物**:
- ✅ RAG 查询功能
- ✅ Chat 界面
- ✅ 来源追溯

---

## 🔧 技术选型

### Embedding 模型
**推荐**: `nomic-embed-text`
- 大小: ~274MB
- 维度: 768
- 性能: 优秀
- 支持: Ollama 原生支持

**使用**:
```bash
ollama pull nomic-embed-text
```

### 向量数据库
**选项 1**: 扩展 Tantivy（推荐）
- ✅ 已集成
- ✅ 纯 Rust
- ✅ 高性能
- ⚠️ 需要添加向量支持

**选项 2**: Qdrant
- ✅ 专业向量数据库
- ✅ 功能完整
- ⚠️ 额外依赖

**选项 3**: 自实现
- ✅ 完全控制
- ✅ 轻量级
- ⚠️ 需要实现索引算法

**决策**: 先用自实现（简单场景），后续迁移到 Tantivy 扩展

### 聚类算法
**推荐**: K-means
- 简单高效
- 易于实现
- 适合中小规模

**备选**: HDBSCAN
- 自动确定簇数
- 处理噪声好
- 实现复杂

---

## 📋 验收标准

### Embedding 系统
- [ ] 支持增量索引更新
- [ ] 索引速度 > 100 文件/秒
- [ ] 搜索延迟 < 100ms
- [ ] 内存占用 < 500MB

### 智能链接建议
- [ ] 建议准确率 > 80%
- [ ] 响应时间 < 100ms
- [ ] 支持实时更新
- [ ] UI 流畅不卡顿

### RAG 知识库助手
- [ ] 检索准确率 > 85%
- [ ] 生成质量高
- [ ] 来源可追溯
- [ ] 支持多轮对话

---

## 🚀 立即开始

### 第一步: 安装 Embedding 模型
```bash
ollama pull nomic-embed-text
```

### 第二步: 创建 Embedding Service
```bash
# 创建新文件
touch src-tauri/src/ai/embedding.rs
```

### 第三步: 实现基础功能
```rust
// 1. Ollama Embedding API 调用
// 2. 向量存储
// 3. 相似度计算
```

---

## 💡 创新点

### 1. 混合搜索
```
传统关键词搜索 + 语义向量搜索
↓
精准定位 + 模糊意图
↓
最佳用户体验
```

### 2. 渐进式索引
```
文件保存 → 立即索引
后台批量 → 优化索引
增量更新 → 保持最新
```

### 3. 智能缓存
```
热点笔记 → 缓存 Embedding
冷门笔记 → 按需计算
LRU 策略 → 内存优化
```

---

## 🎯 总结

### 谷歌建议评分
| 建议 | 评分 | 是否采纳 |
|------|------|---------|
| 语义化动态关联 | ⭐⭐⭐⭐⭐ | ✅ P0 |
| 自动化笔记维护 | ⭐⭐⭐⭐ | ✅ P1 |
| 基于全库的 RAG | ⭐⭐⭐⭐⭐ | ✅ P0 |
| 极致隐私本地化 | ⭐⭐⭐⭐⭐ | ✅ 已完成 |
| 协作与工作流 | ⭐⭐⭐ | ⏳ P2-P3 |

### 我们的优势
- ✅ 纯本地化架构
- ✅ Ollama 已集成
- ✅ 文件系统已完善
- ✅ 搜索引擎已有
- ✅ 航空航天级质量

### 下一步行动
1. **立即**: 实现 Embedding Service
2. **本周**: 完成智能链接建议
3. **本月**: 上线 RAG 知识库助手

---

**状态**: 路线图已确定  
**架构**: 纯本地化  
**标准**: 航空航天级  
**开始时间**: 现在！
