# A3Note 高级功能文档
## Advanced Features Documentation

本文档详细介绍 A3Note 的所有高级功能和扩展能力。

---

## 🚀 新增高级功能

### 1. **CI/CD 自动化流水线**

#### **持续集成 (CI)**
位置: `.github/workflows/ci.yml`

**功能**:
- ✅ 多平台测试 (Ubuntu, macOS, Windows)
- ✅ Rust 代码质量检查 (fmt, clippy)
- ✅ 前端代码质量检查 (ESLint, TypeScript)
- ✅ 单元测试和集成测试
- ✅ E2E 测试
- ✅ 代码覆盖率报告
- ✅ 安全漏洞扫描
- ✅ 性能基准测试

**触发条件**:
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

**运行的检查**:
1. **Rust 质量检查**
   - 代码格式化检查
   - Clippy 静态分析
   - 单元测试
   - 集成测试
   - 安全审计

2. **前端质量检查**
   - TypeScript 类型检查
   - ESLint 代码检查
   - Prettier 格式检查
   - 单元测试
   - 覆盖率报告

3. **E2E 测试**
   - Playwright 跨浏览器测试
   - 性能指标收集

4. **构建验证**
   - 多平台构建测试
   - 构建产物上传

#### **自动发布 (Release)**
位置: `.github/workflows/release.yml`

**功能**:
- ✅ 自动构建多平台安装包
- ✅ 创建 GitHub Release
- ✅ 上传安装包到 Release
- ✅ 生成发布说明

**支持的平台**:
- macOS (x64 + ARM64) - DMG
- Windows (x64) - MSI
- Linux (x64) - AppImage + DEB

**触发方式**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

### 2. **性能基准测试**

位置: `src-tauri/benches/file_operations.rs`

**测试项目**:

#### **文件读取性能**
```rust
// 测试不同文件大小的读取性能
- 1KB 文件
- 10KB 文件
- 100KB 文件
- 1MB 文件
```

#### **文件写入性能**
```rust
// 测试不同大小内容的写入性能
- 1KB 内容
- 10KB 内容
- 100KB 内容
- 1MB 内容
```

#### **原子写入性能**
```rust
// 测试原子写入操作（临时文件 + 重命名）
- 对比普通写入 vs 原子写入
- 测量性能开销
```

#### **目录列表性能**
```rust
// 测试不同文件数量的目录列表性能
- 10 个文件
- 100 个文件
- 1000 个文件
```

#### **搜索性能**
```rust
// 测试全文搜索性能
- 100 个文件中搜索关键词
- 测量搜索延迟
```

**运行基准测试**:
```bash
cd src-tauri
cargo bench
```

**查看结果**:
```bash
open target/criterion/report/index.html
```

---

### 3. **文件系统监控**

位置: `src-tauri/src/watcher.rs`

**功能**:
- ✅ 实时监控工作区文件变化
- ✅ 检测外部程序的文件修改
- ✅ 自动刷新文件列表
- ✅ 防止数据冲突

**监控的事件**:
```rust
pub enum FileSystemEvent {
    Created { path: String },      // 文件创建
    Modified { path: String },     // 文件修改
    Deleted { path: String },      // 文件删除
    Renamed { old_path, new_path } // 文件重命名
}
```

**使用示例**:
```rust
start_watching("/path/to/workspace", |event| {
    match event {
        FileSystemEvent::Modified { path } => {
            println!("File modified: {}", path);
            // 通知前端刷新
        }
        _ => {}
    }
})?;
```

**特性**:
- 2秒防抖，避免频繁触发
- 递归监控子目录
- 跨平台支持
- 低 CPU 占用

---

### 4. **Markdown 预览**

位置: `src/components/MarkdownPreview.tsx`

**功能**:
- ✅ 实时 Markdown 渲染
- ✅ GitHub Flavored Markdown (GFM)
- ✅ XSS 防护（DOMPurify）
- ✅ 代码高亮支持
- ✅ 表格支持
- ✅ 任务列表支持

**支持的 Markdown 特性**:
```markdown
# 标题 (H1-H6)
**粗体** *斜体* ~~删除线~~
[链接](url)
![图片](url)

- 无序列表
1. 有序列表

> 引用块

`行内代码`

​```语言
代码块
​```

| 表格 | 支持 |
|------|------|
| 单元格 | 内容 |

- [ ] 任务列表
- [x] 已完成任务
```

**使用方式**:
```tsx
<MarkdownPreview 
  content={markdownContent}
  className="custom-class"
/>
```

**安全性**:
- 使用 DOMPurify 清理 HTML
- 白名单标签和属性
- 防止 XSS 攻击

---

### 5. **设置管理系统**

位置: `src/components/Settings.tsx`

**可配置项**:

#### **外观设置**
```typescript
- 主题: Dark / Light / Auto
- 字体大小: 10-24px
```

#### **编辑器设置**
```typescript
- 自动保存: 开/关
- 自动保存延迟: 1-10秒
- 拼写检查: 开/关
- 行号显示: 开/关
- 自动换行: 开/关
- Tab 大小: 2/4/6/8 空格
```

**数据持久化**:
```typescript
// 保存到 localStorage
localStorage.setItem('appSettings', JSON.stringify(settings));

// 加载设置
const settings = JSON.parse(localStorage.getItem('appSettings'));
```

**设置变更通知**:
```typescript
// 监听设置变更
window.addEventListener('settingsChanged', (event) => {
  const newSettings = event.detail;
  // 应用新设置
});
```

---

### 6. **导出功能**

位置: `src-tauri/src/export.rs`

**支持的格式**:

#### **HTML 导出**
```rust
export_file_to_html(content, title, output_path)
```

**特性**:
- ✅ 完整的 HTML5 文档
- ✅ 内嵌 CSS 样式
- ✅ 响应式设计
- ✅ 打印优化
- ✅ 支持所有 Markdown 特性

**生成的 HTML 包含**:
- 语义化标签
- 美观的样式
- 代码高亮
- 表格样式
- 打印媒体查询

#### **纯文本导出**
```rust
export_file_to_text(content, output_path)
```

**特性**:
- ✅ 移除所有 Markdown 格式
- ✅ 保留纯文本内容
- ✅ 适合复制粘贴

**使用示例**:
```typescript
// 导出为 HTML
await invoke('export_file_to_html', {
  content: markdownContent,
  title: 'My Note',
  outputPath: '/path/to/output.html'
});

// 导出为纯文本
await invoke('export_file_to_text', {
  content: markdownContent,
  outputPath: '/path/to/output.txt'
});
```

---

## 📊 性能优化

### **已实现的优化**:

1. **防抖和节流**
   - 自动保存: 2秒防抖
   - 搜索输入: 300ms 防抖
   - 文件监控: 2秒防抖

2. **原子操作**
   - 文件写入使用临时文件
   - 重命名保证原子性
   - 防止数据损坏

3. **并发安全**
   - Rust 所有权系统
   - 无数据竞争
   - 线程安全

4. **内存优化**
   - 流式文件读取
   - 及时释放资源
   - 避免内存泄漏

---

## 🔒 安全增强

### **多层安全防护**:

1. **输入验证**
   - 路径验证
   - 文件名验证
   - 大小限制
   - 扩展名白名单

2. **XSS 防护**
   - DOMPurify 清理
   - 白名单标签
   - 属性过滤

3. **路径遍历防护**
   - 路径规范化
   - `..` 检测
   - 绝对路径验证

4. **依赖安全**
   - 定期安全审计
   - 自动漏洞扫描
   - 及时更新依赖

---

## 🧪 测试覆盖

### **新增测试**:

1. **导出功能测试**
   - HTML 导出测试
   - 文本导出测试
   - 表格导出测试
   - 代码块导出测试

2. **文件监控测试**
   - 创建事件测试
   - 修改事件测试
   - 删除事件测试
   - 重命名事件测试

3. **性能基准测试**
   - 读写性能测试
   - 搜索性能测试
   - 目录列表性能测试

---

## 📚 使用指南

### **启用文件监控**:
```typescript
// 在工作区加载时自动启用
// 无需手动配置
```

### **使用 Markdown 预览**:
```typescript
import MarkdownPreview from './components/MarkdownPreview';

<MarkdownPreview content={editorContent} />
```

### **打开设置面板**:
```typescript
import Settings from './components/Settings';

const [settingsOpen, setSettingsOpen] = useState(false);

{settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
```

### **导出文件**:
```typescript
import { invoke } from '@tauri-apps/api/core';

// 导出为 HTML
await invoke('export_file_to_html', {
  content: currentContent,
  title: currentFile.name,
  outputPath: selectedPath
});
```

---

## 🎯 最佳实践

### **性能优化建议**:
1. 使用防抖避免频繁操作
2. 大文件分块处理
3. 启用虚拟滚动
4. 延迟加载非关键组件

### **安全建议**:
1. 始终验证用户输入
2. 使用白名单而非黑名单
3. 定期更新依赖
4. 运行安全审计

### **测试建议**:
1. 保持高测试覆盖率
2. 编写集成测试
3. 定期运行基准测试
4. 使用 CI/CD 自动化

---

## 🔮 未来规划

### **计划中的功能**:
- [ ] PDF 直接导出（无需 HTML 中间步骤）
- [ ] 图片优化和压缩
- [ ] 实时协作编辑
- [ ] 云同步支持
- [ ] 移动端应用
- [ ] Web 版本
- [ ] 插件市场

---

## 📞 技术支持

### **获取帮助**:
- 查看文档: `README.md`, `TESTING.md`
- 运行测试: `npm test`, `cargo test`
- 性能分析: `cargo bench`
- 提交 Issue: GitHub Issues

---

**A3Note - 航空航天级别的笔记应用** 🚀

持续改进，追求卓越！
