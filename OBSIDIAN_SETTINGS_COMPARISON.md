# 📊 Obsidian vs A3Note 配置功能对比

**对比时间**: 2026-03-23  
**目标**: 对齐 Obsidian 的配置功能

---

## 🔍 Obsidian 配置功能清单

### 1. 编辑器 (Editor)
- ✅ **显示行号** - Line numbers
- ✅ **自动换行** - Readable line length
- ✅ **拼写检查** - Spell check
- ❌ **严格换行** - Strict line breaks
- ❌ **显示缩进参考线** - Show indentation guides
- ❌ **显示前置元数据** - Show frontmatter
- ❌ **默认视图模式** - Default view mode (Source/Live Preview/Reading)
- ❌ **Vim 键绑定** - Vim key bindings
- ❌ **智能缩进列表** - Smart indent lists
- ❌ **折叠标题** - Fold heading
- ❌ **折叠缩进** - Fold indent
- ❌ **自动配对括号** - Auto pair brackets
- ❌ **自动配对 Markdown** - Auto pair Markdown syntax

### 2. 文件与链接 (Files & Links)
- ❌ **确认删除文件** - Confirm file deletion
- ❌ **删除文件到系统回收站** - Delete to system trash
- ❌ **新建笔记位置** - Default location for new notes
- ❌ **新建附件位置** - Default location for attachments
- ❌ **自动更新内部链接** - Automatically update internal links
- ❌ **使用 Wiki 链接** - Use [[Wikilinks]]
- ❌ **检测所有文件扩展名** - Detect all file extensions
- ❌ **排除的文件** - Excluded files

### 3. 外观 (Appearance)
- ✅ **主题** - Theme (Dark/Light)
- ✅ **语言** - Language
- ✅ **字体大小** - Font size
- ❌ **基础主题** - Base theme (Dark/Light/Adapt to system)
- ❌ **CSS 代码片段** - CSS snippets
- ❌ **字体** - Text font / Monospace font
- ❌ **界面缩放** - Interface zoom
- ❌ **快速字体大小调整** - Quick font size adjustment
- ❌ **原生菜单** - Native menus
- ❌ **显示内联标题** - Show inline title
- ❌ **显示标签页标题栏** - Show tab title bar
- ❌ **堆叠标签页** - Stack tabs

### 4. 热键 (Hotkeys)
- ❌ **自定义快捷键** - Custom hotkeys
- ❌ **快捷键冲突检测** - Hotkey conflict detection
- ❌ **搜索命令** - Search commands

### 5. 核心插件 (Core Plugins)
- ❌ **文件恢复** - File recovery
- ❌ **工作区** - Workspaces
- ❌ **快速切换** - Quick switcher
- ❌ **图谱视图** - Graph view
- ❌ **反向链接** - Backlinks
- ❌ **标签面板** - Tags pane
- ❌ **页面预览** - Page preview
- ❌ **星标** - Starred
- ❌ **模板** - Templates
- ❌ **日记** - Daily notes
- ❌ **随机笔记** - Random note
- ❌ **大纲** - Outline
- ❌ **字数统计** - Word count
- ❌ **幻灯片** - Slides
- ❌ **音频录制** - Audio recorder
- ❌ **发布** - Publish
- ❌ **同步** - Sync

### 6. 社区插件 (Community Plugins)
- ❌ **浏览插件** - Browse plugins
- ❌ **已安装插件** - Installed plugins
- ❌ **安全模式** - Safe mode

### 7. 关于 (About)
- ❌ **版本信息** - Version
- ❌ **许可证** - License
- ❌ **检查更新** - Check for updates
- ❌ **自动更新** - Automatic updates
- ❌ **调试模式** - Debug mode
- ❌ **开发者工具** - Developer tools

---

## 📊 A3Note 当前配置

### ✅ 已实现
1. **外观设置**
   - 主题切换 (Dark/Light)
   - 语言选择 (24种语言)
   - 字体大小调整

2. **编辑器设置**
   - 自动保存 + 延迟时间
   - 拼写检查
   - 显示行号
   - 自动换行
   - Tab 大小

3. **AI 设置**
   - 本地 AI 模型配置
   - 模型加载/卸载

---

## ❌ 缺失的重要功能

### 高优先级 (必须补充)
1. **编辑器高级选项**
   - [ ] Vim 键绑定开关
   - [ ] 默认视图模式 (Source/Live Preview/Reading)
   - [ ] 显示前置元数据
   - [ ] 智能缩进列表
   - [ ] 折叠功能配置
   - [ ] 自动配对括号/Markdown

2. **文件与链接**
   - [ ] 确认删除文件
   - [ ] 删除到回收站
   - [ ] 新建笔记位置
   - [ ] 附件存储位置
   - [ ] 自动更新链接
   - [ ] Wiki 链接格式

3. **外观高级选项**
   - [ ] 自适应系统主题
   - [ ] CSS 代码片段
   - [ ] 自定义字体
   - [ ] 界面缩放
   - [ ] 显示内联标题
   - [ ] 标签页配置

4. **热键管理**
   - [ ] 自定义快捷键
   - [ ] 快捷键冲突检测
   - [ ] 命令搜索

5. **核心功能配置**
   - [ ] 工作区管理
   - [ ] 模板配置
   - [ ] 日记配置
   - [ ] 图谱视图设置
   - [ ] 反向链接设置

### 中优先级
6. **性能与缓存**
   - [ ] 缓存大小限制
   - [ ] 索引设置
   - [ ] 性能优化选项

7. **安全与隐私**
   - [ ] 安全模式
   - [ ] 调试模式
   - [ ] 数据导出

8. **插件系统**
   - [ ] 插件管理
   - [ ] 插件市场
   - [ ] 插件配置

---

## 🎯 建议补充的配置结构

### 新增配置分类

#### 1. 编辑器 (Editor)
```typescript
interface EditorSettings {
  // 基础
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  spellCheck: boolean;
  tabSize: number;
  
  // 新增
  vimMode: boolean;
  defaultViewMode: 'source' | 'live-preview' | 'reading';
  showFrontmatter: boolean;
  showIndentGuides: boolean;
  strictLineBreaks: boolean;
  smartIndentLists: boolean;
  foldHeading: boolean;
  foldIndent: boolean;
  autoPairBrackets: boolean;
  autoPairMarkdown: boolean;
}
```

#### 2. 文件与链接 (Files & Links)
```typescript
interface FilesLinksSettings {
  confirmFileDelete: boolean;
  deleteToTrash: boolean;
  newNoteLocation: 'root' | 'current' | 'folder';
  newNoteFolderPath: string;
  attachmentLocation: 'root' | 'current' | 'folder';
  attachmentFolderPath: string;
  autoUpdateLinks: boolean;
  useWikiLinks: boolean;
  excludedFiles: string[];
}
```

#### 3. 外观高级 (Appearance Advanced)
```typescript
interface AppearanceAdvancedSettings {
  baseTheme: 'dark' | 'light' | 'system';
  cssSnippets: string[];
  textFont: string;
  monospaceFont: string;
  interfaceZoom: number;
  quickFontSizeAdjust: boolean;
  nativeMenus: boolean;
  showInlineTitle: boolean;
  showTabTitleBar: boolean;
  stackTabs: boolean;
}
```

#### 4. 热键 (Hotkeys)
```typescript
interface HotkeySettings {
  customHotkeys: Record<string, string>;
  detectConflicts: boolean;
  enabledCommands: string[];
}
```

#### 5. 核心功能 (Core Features)
```typescript
interface CoreFeaturesSettings {
  // 工作区
  workspaces: {
    enabled: boolean;
    autoSave: boolean;
  };
  
  // 模板
  templates: {
    enabled: boolean;
    folder: string;
    dateFormat: string;
    timeFormat: string;
  };
  
  // 日记
  dailyNotes: {
    enabled: boolean;
    folder: string;
    dateFormat: string;
    template: string;
  };
  
  // 图谱
  graph: {
    enabled: boolean;
    showTags: boolean;
    showAttachments: boolean;
    showOrphans: boolean;
  };
  
  // 反向链接
  backlinks: {
    enabled: boolean;
    showInDocument: boolean;
    collapseByDefault: boolean;
  };
}
```

#### 6. 性能 (Performance)
```typescript
interface PerformanceSettings {
  cacheSize: number;
  indexingEnabled: boolean;
  lazyLoading: boolean;
  maxFileSize: number;
}
```

#### 7. 高级 (Advanced)
```typescript
interface AdvancedSettings {
  debugMode: boolean;
  developerMode: boolean;
  autoUpdate: boolean;
  telemetry: boolean;
  experimentalFeatures: boolean;
}
```

---

## 📋 实施计划

### 阶段 1: 编辑器高级选项 (立即)
- [ ] Vim 模式开关
- [ ] 视图模式选择
- [ ] 折叠配置
- [ ] 自动配对功能

### 阶段 2: 文件与链接 (高优先级)
- [ ] 文件操作确认
- [ ] 路径配置
- [ ] 链接管理

### 阶段 3: 外观高级 (中优先级)
- [ ] 系统主题适配
- [ ] 字体配置
- [ ] 界面缩放
- [ ] CSS 片段

### 阶段 4: 热键与命令 (中优先级)
- [ ] 快捷键管理
- [ ] 命令面板增强

### 阶段 5: 核心功能配置 (持续)
- [ ] 工作区
- [ ] 模板系统
- [ ] 日记功能
- [ ] 图谱配置

---

## 🎯 优先级建议

### 立即实现 (今天)
1. ✅ Vim 模式开关
2. ✅ 视图模式选择
3. ✅ 自动配对括号/Markdown
4. ✅ 折叠配置

### 本周实现
5. 文件操作确认
6. 新建笔记/附件位置
7. 自动更新链接
8. 系统主题适配

### 下周实现
9. 自定义快捷键
10. 工作区管理
11. 模板配置增强
12. 性能优化选项

---

**对比结论**: A3Note 当前只实现了约 **15%** 的 Obsidian 配置功能。建议优先补充编辑器高级选项和文件管理配置。
