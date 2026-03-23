# 📸 媒体支持测试文档

本文档用于测试 A3Note 的图片、视频和音频嵌入功能。

---

## 📷 图片测试

### 标准 Markdown 语法

```markdown
![Alt text](image.png)
![Logo](https://picsum.photos/200/300)
```

**效果**：
![Test Image](https://picsum.photos/200/300)

### Obsidian 语法 - 基础

```markdown
![[image.png]]
```

**效果**：
![[test-image.png]]

### Obsidian 语法 - 指定宽度

```markdown
![[image.png|200]]
```

**效果**：
![[test-image.png|200]]

### Obsidian 语法 - 指定宽高

```markdown
![[image.png|300x200]]
```

**效果**：
![[test-image.png|300x200]]

### Obsidian 语法 - 带标题

```markdown
![[image.png|This is a beautiful image]]
```

**效果**：
![[test-image.png|This is a beautiful image]]

---

## 🎬 视频测试

### Obsidian 视频语法

```markdown
![[video.mp4]]
![[demo.webm]]
```

**效果**：
![[sample-video.mp4]]

### HTML5 视频标签

```html
<video src="demo.mp4" controls width="640"></video>
```

**效果**：
<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="640"></video>

---

## 🎵 音频测试

### Obsidian 音频语法

```markdown
![[audio.mp3]]
![[music.wav]]
```

**效果**：
![[sample-audio.mp3]]

### HTML5 音频标签

```html
<audio src="audio.mp3" controls></audio>
```

**效果**：
<audio src="https://www.w3schools.com/html/horse.mp3" controls></audio>

---

## 🖼️ 多媒体组合

### 图文混排

这是一段文字，后面跟着一张图片：

![[image1.png|150]]

图片后面继续文字，再来一张：

![[image2.png|150]]

### 视频和文字

观看这个演示视频：

![[tutorial.mp4]]

视频展示了如何使用 A3Note 的基本功能。

---

## 🔗 外部资源

### 外部图片

![Random Image](https://picsum.photos/400/300)

### 外部视频（YouTube 嵌入）

虽然 Obsidian 支持 YouTube 嵌入，但标准 Markdown 需要使用 iframe：

```html
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
  frameborder="0" allowfullscreen>
</iframe>
```

---

## ✅ 支持的格式

### 图片格式
- ✅ PNG (.png)
- ✅ JPEG (.jpg, .jpeg)
- ✅ GIF (.gif)
- ✅ WebP (.webp)
- ✅ SVG (.svg)
- ✅ BMP (.bmp)

### 视频格式
- ✅ MP4 (.mp4)
- ✅ WebM (.webm)
- ✅ OGV (.ogv)
- ✅ MOV (.mov)
- ✅ MKV (.mkv)

### 音频格式
- ✅ MP3 (.mp3)
- ✅ WAV (.wav)
- ✅ M4A (.m4a)
- ✅ OGG (.ogg)
- ✅ FLAC (.flac)

---

## 🎯 测试清单

- [ ] 标准 Markdown 图片语法
- [ ] Obsidian `![[]]` 图片语法
- [ ] 图片尺寸参数
- [ ] 图片标题/说明
- [ ] 本地图片文件
- [ ] 外部图片 URL
- [ ] 视频嵌入
- [ ] 视频播放控件
- [ ] 音频嵌入
- [ ] 音频播放控件
- [ ] 响应式布局
- [ ] 图片点击放大

---

## 📝 使用说明

### 插入图片

1. **使用工具栏**：点击图片按钮 📷
2. **快捷键**：无（可自定义）
3. **手动输入**：
   - Markdown: `![alt](path)`
   - Obsidian: `![[path]]`

### 插入视频

1. **使用工具栏**：点击视频按钮 🎬
2. **手动输入**：`![[video.mp4]]`

### 插入音频

1. **使用工具栏**：点击音频按钮 🎵
2. **手动输入**：`![[audio.mp3]]`

---

## 🐛 已知问题

1. 本地文件路径需要正确配置工作区路径
2. 某些视频格式可能需要浏览器支持
3. 大文件可能影响性能

---

## 🚀 未来改进

- [ ] 拖拽上传图片/视频
- [ ] 粘贴剪贴板图片
- [ ] 图片编辑功能
- [ ] 视频缩略图
- [ ] 图片懒加载
- [ ] 媒体文件管理器

---

**测试完成日期**: 2026-03-23
**版本**: v2.0
