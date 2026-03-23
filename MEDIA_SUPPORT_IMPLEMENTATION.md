# 📸 A3Note 图片与视频支持实现方案

## 📊 当前状态分析

### ✅ 已实现功能

1. **基础图片语法支持**
   - Markdown 标准语法：`![alt text](image.png)`
   - 工具栏快捷插入按钮
   - MarkdownPreview 组件支持 `<img>` 标签渲染

2. **安全性**
   - DOMPurify 清理 HTML，允许 `img` 标签
   - 允许的属性：`src`, `alt`, `title`

### ❌ 缺失功能（与 Obsidian 对比）

1. **Obsidian 特有语法**
   - `![[image.png]]` - Obsidian 内部链接语法
   - `![[image.png|width]]` - 指定宽度
   - `![[image.png|width x height]]` - 指定宽高
   - `![[video.mp4]]` - 视频嵌入

2. **视频支持**
   - 无 `<video>` 标签支持
   - 无视频文件格式识别
   - 无视频播放控件

3. **高级功能**
   - 拖拽上传图片/视频
   - 粘贴剪贴板图片
   - 图片缩放和预览
   - 本地文件路径解析

---

## 🎯 Obsidian 媒体支持规范

### 图片语法

```markdown
# 标准 Markdown
![](image.png)
![Alt text](image.png)
![Alt text](image.png "Title")

# Obsidian 内部链接
![[image.png]]
![[image.png|100]]           # 宽度 100px
![[image.png|100x200]]       # 宽 100px，高 200px
![[Folder/image.png]]        # 子文件夹
![[image.png|Custom caption]]

# 外部链接
![](https://example.com/image.png)
```

### 视频语法

```markdown
# Obsidian 视频嵌入
![[video.mp4]]
![[video.webm]]
![[video.ogv]]

# HTML5 视频标签
<video src="video.mp4" controls></video>
```

### 音频语法

```markdown
![[audio.mp3]]
![[audio.wav]]
![[audio.ogg]]

<audio src="audio.mp3" controls></audio>
```

### 支持的文件格式

**图片**：
- `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.svg`, `.webp`

**视频**：
- `.mp4`, `.webm`, `.ogv`, `.mov`, `.mkv`

**音频**：
- `.mp3`, `.wav`, `.m4a`, `.ogg`, `.3gp`, `.flac`

---

## 🚀 实现方案

### 阶段 1：增强图片支持

#### 1.1 Obsidian 语法解析

```typescript
// 解析 ![[image.png|width x height]]
function parseObsidianImage(text: string): ImageEmbed | null {
  const match = text.match(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (!match) return null;
  
  const [, path, params] = match;
  let width, height, caption;
  
  if (params) {
    // 检查是否是尺寸参数
    const sizeMatch = params.match(/^(\d+)(?:x(\d+))?$/);
    if (sizeMatch) {
      width = parseInt(sizeMatch[1]);
      height = sizeMatch[2] ? parseInt(sizeMatch[2]) : undefined;
    } else {
      caption = params;
    }
  }
  
  return { path, width, height, caption };
}
```

#### 1.2 图片渲染增强

```typescript
// MarkdownPreview.tsx 增强
function renderImage(src: string, alt: string, width?: number, height?: number) {
  const style: React.CSSProperties = {};
  if (width) style.width = `${width}px`;
  if (height) style.height = `${height}px`;
  
  return (
    <img 
      src={resolveImagePath(src)} 
      alt={alt}
      style={style}
      className="markdown-image"
      loading="lazy"
    />
  );
}

// 解析本地文件路径
function resolveImagePath(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  // 相对于当前笔记的路径
  return `file://${workspacePath}/${src}`;
}
```

### 阶段 2：视频支持

#### 2.1 视频语法解析

```typescript
function parseObsidianVideo(text: string): VideoEmbed | null {
  const match = text.match(/!\[\[([^\]]+\.(mp4|webm|ogv|mov|mkv))\]\]/i);
  if (!match) return null;
  
  return {
    path: match[1],
    format: match[2]
  };
}
```

#### 2.2 视频渲染组件

```typescript
function VideoPlayer({ src, format }: { src: string; format: string }) {
  return (
    <video 
      controls 
      className="markdown-video"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <source src={resolveVideoPath(src)} type={`video/${format}`} />
      Your browser does not support the video tag.
    </video>
  );
}
```

#### 2.3 更新 DOMPurify 配置

```typescript
const cleanHtml = DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: [
    // ... 现有标签
    'video', 'audio', 'source',
  ],
  ALLOWED_ATTR: [
    // ... 现有属性
    'controls', 'autoplay', 'loop', 'muted',
    'width', 'height', 'poster',
  ],
});
```

### 阶段 3：拖拽和粘贴上传

#### 3.1 拖拽上传

```typescript
function handleDrop(e: React.DragEvent) {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  
  files.forEach(async (file) => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const savedPath = await saveMediaFile(file);
      insertMediaSyntax(savedPath, file.type);
    }
  });
}
```

#### 3.2 粘贴上传

```typescript
function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        const savedPath = await saveMediaFile(file);
        insertMediaSyntax(savedPath, 'image');
      }
    }
  }
}
```

### 阶段 4：Editor 实时预览

#### 4.1 图片内联预览

```typescript
// 在 Editor 中添加图片预览装饰
const imagePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    
    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = [];
      const text = view.state.doc.toString();
      
      // 匹配图片语法
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(text)) !== null) {
        const [fullMatch, alt, src] = match;
        const from = match.index;
        const to = from + fullMatch.length;
        
        // 创建图片预览小部件
        decorations.push(
          Decoration.widget({
            widget: new ImagePreviewWidget(src, alt),
            side: 1
          }).range(to)
        );
      }
      
      return Decoration.set(decorations);
    }
  }
);
```

---

## 📝 实现清单

### 优先级 1（核心功能）

- [ ] 解析 Obsidian `![[image.png]]` 语法
- [ ] 支持图片尺寸参数 `![[image.png|width]]`
- [ ] 本地文件路径解析
- [ ] 视频文件嵌入 `![[video.mp4]]`
- [ ] 更新 DOMPurify 允许 video/audio 标签
- [ ] 添加视频播放控件

### 优先级 2（增强功能）

- [ ] 拖拽上传图片/视频
- [ ] 粘贴剪贴板图片
- [ ] 图片缩放和预览
- [ ] 视频缩略图生成
- [ ] 媒体文件管理器

### 优先级 3（高级功能）

- [ ] Editor 内图片实时预览
- [ ] 图片编辑功能（裁剪、旋转）
- [ ] 视频时间戳链接
- [ ] 外部视频嵌入（YouTube, Bilibili）
- [ ] 图片懒加载优化

---

## 🔧 技术实现细节

### 文件结构

```
src/
├── components/
│   ├── Editor.tsx                    # 需要更新
│   ├── MarkdownPreview.tsx           # 需要更新
│   ├── MarkdownToolbar.tsx           # 添加视频按钮
│   └── MediaViewer.tsx               # 新建：媒体查看器
├── services/
│   └── media.ts                      # 新建：媒体处理服务
└── utils/
    ├── mediaParser.ts                # 新建：媒体语法解析
    └── fileUpload.ts                 # 新建：文件上传处理
```

### 依赖包

```json
{
  "dependencies": {
    "file-type": "^18.0.0",           // 文件类型检测
    "image-size": "^1.0.0",           // 图片尺寸获取
    "video-metadata": "^1.0.0"        // 视频元数据
  }
}
```

---

## 🎨 UI/UX 设计

### 图片显示

```css
.markdown-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
}

.markdown-image:hover {
  opacity: 0.9;
  transition: opacity 0.2s;
}
```

### 视频播放器

```css
.markdown-video {
  max-width: 100%;
  border-radius: 8px;
  background: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.markdown-video::-webkit-media-controls-panel {
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
}
```

---

## 🧪 测试用例

### 图片测试

```markdown
# 标准 Markdown
![Test Image](test.png)

# Obsidian 语法
![[test.png]]
![[test.png|200]]
![[test.png|200x150]]
![[test.png|This is a caption]]

# 外部链接
![](https://picsum.photos/200/300)
```

### 视频测试

```markdown
# 本地视频
![[demo.mp4]]
![[demo.webm]]

# HTML5 视频
<video src="demo.mp4" controls width="640"></video>
```

---

## 📊 性能优化

1. **懒加载**
   - 使用 `loading="lazy"` 属性
   - Intersection Observer API

2. **缓存**
   - 本地文件路径缓存
   - 缩略图缓存

3. **压缩**
   - 自动压缩大图片
   - 视频转码优化

---

## 🔒 安全考虑

1. **文件类型验证**
   - 白名单验证文件扩展名
   - MIME 类型检查

2. **路径安全**
   - 防止路径遍历攻击
   - 限制访问范围

3. **内容安全**
   - DOMPurify 清理
   - CSP 策略配置

---

## 📅 实施时间表

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | Obsidian 图片语法支持 | 2 天 |
| 2 | 视频嵌入支持 | 2 天 |
| 3 | 拖拽和粘贴上传 | 3 天 |
| 4 | Editor 实时预览 | 3 天 |
| 5 | 测试和优化 | 2 天 |

**总计**: 12 天

---

## 🎯 成功标准

- ✅ 支持所有 Obsidian 图片语法
- ✅ 支持主流视频格式嵌入
- ✅ 拖拽上传功能正常
- ✅ 粘贴图片功能正常
- ✅ 性能无明显下降
- ✅ 通过所有测试用例

---

**下一步**: 开始实现阶段 1 - Obsidian 图片语法支持
