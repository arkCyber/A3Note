# 🖱️ A3Note 右键菜单功能审计报告

**审计日期**: 2026-03-23  
**对比基准**: Obsidian 官方应用  
**标准**: 航空航天级  

---

## 📋 Obsidian 右键菜单功能清单

### 1. 文件列表右键菜单

#### 文件右键菜单
- ✅ **打开** (Open)
- ⚠️ **在新标签页打开** (Open in new tab) - 缺失
- ⚠️ **在新窗口打开** (Open in new window) - 缺失
- ⚠️ **在侧边栏打开** (Open to the right) - 缺失
- ✅ **重命名** (Rename)
- ✅ **复制路径** (Copy path)
- ⚠️ **复制 Obsidian URL** (Copy Obsidian URL) - 缺失
- ⚠️ **在文件管理器中显示** (Show in system explorer) - 缺失
- ⚠️ **移动到** (Move to) - 缺失
- ⚠️ **复制文件** (Duplicate) - 缺失
- ✅ **删除** (Delete)
- ⚠️ **添加到收藏** (Star) - 缺失
- ⚠️ **文件属性** (Properties) - 缺失

#### 文件夹右键菜单
- ✅ **新建文件** (New file)
- ✅ **新建文件夹** (New folder)
- ⚠️ **新建 Canvas** (New canvas) - 缺失
- ✅ **重命名** (Rename)
- ⚠️ **移动到** (Move to) - 缺失
- ✅ **删除** (Delete)
- ⚠️ **在文件管理器中显示** (Show in system explorer) - 缺失
- ⚠️ **折叠所有** (Collapse all) - 缺失

### 2. 编辑器右键菜单

#### 文本选中右键菜单
- ❌ **剪切** (Cut)
- ❌ **复制** (Copy)
- ❌ **粘贴** (Paste)
- ❌ **全选** (Select all)
- ❌ **查找** (Find)
- ❌ **替换** (Replace)
- ❌ **插入链接** (Insert link)
- ❌ **插入图片** (Insert image)
- ❌ **插入代码块** (Insert code block)
- ❌ **加粗** (Bold)
- ❌ **斜体** (Italic)
- ❌ **高亮** (Highlight)
- ❌ **删除线** (Strikethrough)

#### 链接右键菜单
- ❌ **打开链接** (Open link)
- ❌ **在新标签页打开** (Open in new tab)
- ❌ **复制链接** (Copy link)
- ❌ **编辑链接** (Edit link)

### 3. 标签页右键菜单
- ✅ **固定标签页** (Pin tab)
- ✅ **复制文件路径** (Copy file path)
- ✅ **在文件管理器中显示** (Reveal in file explorer)
- ✅ **关闭** (Close)
- ✅ **关闭其他标签页** (Close others)
- ✅ **关闭右侧标签页** (Close tabs to the right)
- ✅ **关闭左侧标签页** (Close tabs to the left)
- ⚠️ **在新窗口打开** (Open in new window) - 缺失
- ⚠️ **分屏** (Split) - 缺失

### 4. 其他右键菜单

#### 书签右键菜单
- ❌ **打开** (Open)
- ❌ **在新标签页打开** (Open in new tab)
- ❌ **重命名** (Rename)
- ❌ **移动到分组** (Move to group)
- ❌ **删除** (Remove)

#### 标签右键菜单
- ❌ **搜索标签** (Search tag)
- ❌ **重命名标签** (Rename tag)
- ❌ **删除标签** (Delete tag)

#### 反向链接右键菜单
- ❌ **打开** (Open)
- ❌ **在新标签页打开** (Open in new tab)
- ❌ **复制链接** (Copy link)

---

## 📊 实现状态统计

### 已实现功能 ✅

**文件列表 (5/13)**:
- ✅ 打开文件
- ✅ 重命名
- ✅ 复制路径
- ✅ 删除
- ✅ 新建文件/文件夹

**标签页 (7/9)**:
- ✅ 固定标签页
- ✅ 复制文件路径
- ✅ 在文件管理器中显示
- ✅ 关闭相关操作 (4 种)

**总计**: 12/60+ = **20%**

### 缺失功能 ❌

**高优先级 (必须实现)**:
1. 编辑器文本右键菜单 (13 项)
2. 文件多标签页打开 (3 项)
3. 文件操作增强 (5 项)

**中优先级 (重要)**:
4. 书签右键菜单 (5 项)
5. 标签右键菜单 (3 项)
6. 链接右键菜单 (4 项)

**低优先级 (可选)**:
7. 反向链接右键菜单 (3 项)
8. 其他辅助功能

---

## 🎯 详细功能规格

### 1. 编辑器文本右键菜单 (EditorContextMenu)

**触发条件**: 在编辑器中右键点击

**菜单项**:
```typescript
interface EditorContextMenuProps {
  x: number;
  y: number;
  selectedText: string;
  hasSelection: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFind: () => void;
  onReplace: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onInsertCodeBlock: () => void;
  onBold: () => void;
  onItalic: () => void;
  onHighlight: () => void;
  onStrikethrough: () => void;
}
```

**菜单结构**:
```
✂️ Cut (Ctrl+X)
📋 Copy (Ctrl+C)
📄 Paste (Ctrl+V)
────────────────
🔍 Find (Ctrl+F)
🔄 Replace (Ctrl+H)
📝 Select all (Ctrl+A)
────────────────
🔗 Insert link (Ctrl+K)
🖼️ Insert image
💻 Insert code block
────────────────
**B** Bold (Ctrl+B)
*I* Italic (Ctrl+I)
🎨 Highlight (Ctrl+Shift+H)
~~S~~ Strikethrough
```

### 2. 增强文件右键菜单 (EnhancedFileContextMenu)

**新增功能**:
```typescript
interface EnhancedFileContextMenuProps {
  file: FileItem;
  onOpenInNewTab: () => void;
  onOpenInNewWindow: () => void;
  onOpenToRight: () => void;
  onCopyObsidianURL: () => void;
  onShowInExplorer: () => void;
  onMoveTo: (targetPath: string) => void;
  onDuplicate: () => void;
  onStar: () => void;
  onProperties: () => void;
}
```

**菜单结构**:
```
📂 Open
📑 Open in new tab (Ctrl+Click)
🪟 Open in new window
➡️ Open to the right
────────────────
✏️ Rename
📋 Copy path
🔗 Copy Obsidian URL
📁 Show in system explorer
────────────────
📦 Move to...
📄 Duplicate
⭐ Add to starred
────────────────
ℹ️ Properties
🗑️ Delete
```

### 3. 链接右键菜单 (LinkContextMenu)

**触发条件**: 在编辑器中右键点击链接

**菜单项**:
```typescript
interface LinkContextMenuProps {
  link: string;
  x: number;
  y: number;
  onOpenLink: () => void;
  onOpenInNewTab: () => void;
  onCopyLink: () => void;
  onEditLink: () => void;
}
```

**菜单结构**:
```
🔗 Open link
📑 Open in new tab
📋 Copy link
✏️ Edit link
```

### 4. 书签右键菜单 (BookmarkContextMenu)

**菜单项**:
```typescript
interface BookmarkContextMenuProps {
  bookmark: Bookmark;
  groups: BookmarkGroup[];
  onOpen: () => void;
  onOpenInNewTab: () => void;
  onRename: () => void;
  onMoveToGroup: (groupId: string) => void;
  onRemove: () => void;
}
```

### 5. 标签右键菜单 (TagContextMenu)

**菜单项**:
```typescript
interface TagContextMenuProps {
  tag: string;
  onSearch: () => void;
  onRename: () => void;
  onDelete: () => void;
}
```

---

## 🚀 实施计划

### 阶段 1: 编辑器右键菜单 (高优先级)

**任务 1: EditorContextMenu 组件**
- 创建 `EditorContextMenu.tsx`
- 集成到 `Editor.tsx`
- 实现文本操作 (剪切、复制、粘贴)
- 实现格式化操作 (加粗、斜体等)
- 实现插入操作 (链接、图片、代码块)

**任务 2: LinkContextMenu 组件**
- 创建 `LinkContextMenu.tsx`
- 检测链接点击
- 实现链接操作

**预计时间**: 1-2 天

### 阶段 2: 文件操作增强 (高优先级)

**任务 3: 增强文件右键菜单**
- 更新 `EnhancedSidebar.tsx`
- 添加多标签页打开
- 添加文件移动功能
- 添加文件复制功能
- 添加收藏功能
- 添加属性查看

**预计时间**: 1 天

### 阶段 3: 其他右键菜单 (中优先级)

**任务 4: BookmarkContextMenu**
- 创建 `BookmarkContextMenu.tsx`
- 集成到 `BookmarksPanel.tsx`

**任务 5: TagContextMenu**
- 创建 `TagContextMenu.tsx`
- 集成到 `TagsPanel.tsx`

**预计时间**: 1 天

---

## 📋 组件清单

### 需要创建的组件 (5 个)

1. **EditorContextMenu.tsx** (250 行)
   - 编辑器文本右键菜单
   - 格式化工具
   - 插入工具

2. **LinkContextMenu.tsx** (100 行)
   - 链接操作菜单

3. **EnhancedFileContextMenu.tsx** (200 行)
   - 增强的文件右键菜单
   - 多标签页支持
   - 文件操作增强

4. **BookmarkContextMenu.tsx** (150 行)
   - 书签右键菜单

5. **TagContextMenu.tsx** (100 行)
   - 标签右键菜单

### 需要更新的组件 (3 个)

1. **Editor.tsx**
   - 集成 EditorContextMenu
   - 集成 LinkContextMenu

2. **EnhancedSidebar.tsx**
   - 使用 EnhancedFileContextMenu

3. **BookmarksPanel.tsx** & **TagsPanel.tsx**
   - 集成对应的右键菜单

---

## 🧪 测试计划

### 单元测试 (5 个)

```typescript
// EditorContextMenu.test.tsx
- 渲染测试
- 文本操作测试
- 格式化测试
- 插入功能测试
- 快捷键测试

// LinkContextMenu.test.tsx
- 链接检测测试
- 链接操作测试

// EnhancedFileContextMenu.test.tsx
- 多标签页打开测试
- 文件移动测试
- 文件复制测试
- 收藏功能测试

// BookmarkContextMenu.test.tsx
- 书签操作测试

// TagContextMenu.test.tsx
- 标签操作测试
```

---

## 📊 对齐度评估

| 功能类别 | 当前 | 目标 | 差距 |
|---------|------|------|------|
| 文件右键菜单 | 38% | 100% | 62% |
| 编辑器右键菜单 | 0% | 100% | 100% |
| 标签页右键菜单 | 78% | 100% | 22% |
| 书签右键菜单 | 0% | 100% | 100% |
| 标签右键菜单 | 0% | 100% | 100% |
| **总体对齐度** | **20%** | **100%** | **80%** |

---

## 🎯 优先级排序

### 必须实现 (P0)
1. ✅ 编辑器文本右键菜单 - **最重要**
2. ✅ 文件多标签页打开
3. ✅ 文件移动/复制功能

### 重要 (P1)
4. ⚠️ 链接右键菜单
5. ⚠️ 书签右键菜单
6. ⚠️ 文件属性查看

### 可选 (P2)
7. ⚪ 标签右键菜单
8. ⚪ 反向链接右键菜单
9. ⚪ 分屏功能

---

## 📝 总结

### 当前状态
- ✅ 基础右键菜单框架完善
- ✅ 文件列表右键菜单部分实现
- ✅ 标签页右键菜单基本完整
- ❌ 编辑器右键菜单完全缺失
- ❌ 书签/标签右键菜单缺失

### 关键问题
1. **编辑器右键菜单缺失** - 这是 Obsidian 最常用的功能
2. **文件操作不完整** - 缺少多标签页、移动、复制等
3. **专项右键菜单缺失** - 书签、标签、链接等

### 改进建议
1. **优先实现编辑器右键菜单** - 提升用户体验
2. **增强文件操作** - 提高工作效率
3. **补全专项菜单** - 完善功能覆盖

---

**右键菜单对齐度: 20%**  
**需要补全: 80%**  
**预计工作量: 3-4 天**

---

**审计完成日期**: 2026-03-23  
**审计人**: Cascade AI  
**下一步**: 实施阶段 1 - 编辑器右键菜单
