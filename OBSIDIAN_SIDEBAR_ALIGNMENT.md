# Obsidian 侧边栏对齐分析

**日期**: 2026-03-23  
**目标**: 完全对齐 Obsidian 侧边栏功能、按钮和布局

---

## 🎯 Obsidian 侧边栏特性分析

### 核心功能

#### 1. 文件浏览器
- ✅ 树形结构显示
- ✅ 文件夹展开/折叠
- ✅ 文件/文件夹图标
- ✅ 单击打开文件
- ✅ 右键上下文菜单

#### 2. 顶部工具栏
- ✅ 新建文件按钮
- ✅ 新建文件夹按钮
- ✅ 刷新按钮
- ⏳ 折叠所有按钮
- ⏳ 排序选项（名称、修改时间、创建时间）
- ⏳ 视图切换（列表/树形）

#### 3. 搜索功能
- ⏳ 文件搜索框
- ⏳ 实时过滤
- ⏳ 高亮匹配
- ⏳ 搜索历史

#### 4. 文件操作
- ✅ 创建文件
- ✅ 创建文件夹
- ✅ 重命名
- ✅ 删除
- ✅ 复制路径
- ⏳ 移动文件
- ⏳ 复制文件
- ⏳ 显示文件信息

#### 5. 拖拽功能
- ⏳ 拖拽移动文件
- ⏳ 拖拽到文件夹
- ⏳ 拖拽排序

#### 6. 键盘快捷键
- ⏳ 上下箭头导航
- ⏳ Enter 打开文件
- ⏳ Delete 删除文件
- ⏳ F2 重命名
- ⏳ Ctrl+N 新建文件

---

## 📊 当前实现状态

### ✅ 已实现功能

1. **基础文件树**
   - 树形结构显示
   - 文件夹展开/折叠
   - 文件/文件夹图标
   - 嵌套层级缩进

2. **文件操作**
   - 单击打开文件
   - 创建文件/文件夹
   - 重命名
   - 删除
   - 复制路径

3. **上下文菜单**
   - 右键菜单
   - 文件/文件夹不同菜单
   - 图标 + 文字

4. **UI 样式**
   - 悬停效果
   - 激活状态高亮
   - 平滑过渡动画
   - 图标缩放效果

### ⏳ 缺失功能

1. **搜索和过滤**
   - 文件搜索框
   - 实时过滤
   - 搜索结果高亮

2. **排序选项**
   - 按名称排序
   - 按修改时间排序
   - 按创建时间排序
   - 升序/降序

3. **视图选项**
   - 列表视图
   - 树形视图切换
   - 折叠所有

4. **拖拽功能**
   - 拖拽移动文件
   - 拖拽到文件夹
   - 拖拽排序

5. **键盘导航**
   - 箭头键导航
   - 快捷键操作

6. **文件信息**
   - 文件大小
   - 修改时间
   - 文件数量统计

---

## 🔧 需要实现的改进

### 1. 搜索功能

```typescript
interface SidebarProps {
  // ... 现有 props
  onSearch?: (query: string) => void;
}

// 搜索框组件
<div className="px-3 py-2 border-b border-border">
  <input
    type="text"
    placeholder="搜索文件..."
    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded"
    onChange={(e) => handleSearch(e.target.value)}
  />
</div>
```

### 2. 排序选项

```typescript
type SortBy = 'name' | 'modified' | 'created';
type SortOrder = 'asc' | 'desc';

interface SidebarState {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// 排序下拉菜单
<select onChange={handleSortChange}>
  <option value="name">名称</option>
  <option value="modified">修改时间</option>
  <option value="created">创建时间</option>
</select>
```

### 3. 折叠所有按钮

```typescript
const collapseAll = () => {
  // 递归折叠所有文件夹
  setAllExpanded(false);
};

<button onClick={collapseAll}>
  <ChevronsRight size={14} />
</button>
```

### 4. 文件统计

```typescript
const getFileStats = (files: FileItem[]) => {
  let fileCount = 0;
  let folderCount = 0;
  
  const count = (items: FileItem[]) => {
    items.forEach(item => {
      if (item.isDirectory) {
        folderCount++;
        if (item.children) count(item.children);
      } else {
        fileCount++;
      }
    });
  };
  
  count(files);
  return { fileCount, folderCount };
};

// 显示统计
<div className="text-xs text-foreground/50">
  {fileCount} 个文件, {folderCount} 个文件夹
</div>
```

### 5. 键盘导航

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      navigatePrevious();
      break;
    case 'ArrowDown':
      navigateNext();
      break;
    case 'Enter':
      openCurrentFile();
      break;
    case 'Delete':
      deleteCurrentFile();
      break;
    case 'F2':
      renameCurrentFile();
      break;
  }
};
```

### 6. 拖拽功能

```typescript
const handleDragStart = (e: React.DragEvent, file: FileItem) => {
  e.dataTransfer.setData('file', JSON.stringify(file));
};

const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
  e.preventDefault();
  const file = JSON.parse(e.dataTransfer.getData('file'));
  onMoveFile(file.path, targetFolder.path);
};

<div
  draggable
  onDragStart={(e) => handleDragStart(e, file)}
  onDrop={(e) => handleDrop(e, file)}
>
  {/* 文件项 */}
</div>
```

---

## 🎨 UI/UX 改进

### 1. Obsidian 风格的颜色

```css
/* 当前激活文件 */
.active-file {
  background: rgba(var(--primary-rgb), 0.15);
  border-left: 2px solid var(--primary);
}

/* 悬停效果 */
.file-item:hover {
  background: rgba(var(--accent-rgb), 0.08);
}

/* 文件夹图标颜色 */
.folder-icon {
  color: var(--accent);
}

/* 文件图标颜色 */
.file-icon {
  color: var(--foreground-muted);
}
```

### 2. 更好的间距

```css
/* Obsidian 使用更紧凑的间距 */
.file-tree-item {
  padding: 4px 8px;
  margin: 1px 0;
}

/* 嵌套缩进 */
.nested-level-1 { padding-left: 24px; }
.nested-level-2 { padding-left: 40px; }
.nested-level-3 { padding-left: 56px; }
```

### 3. 图标大小和对齐

```typescript
// Obsidian 使用 16px 图标
<File size={16} />
<Folder size={16} />
<ChevronRight size={12} /> // 展开箭头稍小
```

### 4. 动画效果

```css
/* 展开/折叠动画 */
.folder-children {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停缩放 */
.file-icon:hover {
  transform: scale(1.1);
  transition: transform 0.15s ease;
}
```

---

## 📋 实施计划

### 阶段 1: 搜索和过滤（高优先级）
1. 添加搜索输入框
2. 实现实时过滤逻辑
3. 高亮搜索结果
4. 添加清除搜索按钮

### 阶段 2: 排序功能（高优先级）
1. 添加排序下拉菜单
2. 实现按名称排序
3. 实现按时间排序
4. 添加升序/降序切换

### 阶段 3: 工具栏增强（中优先级）
1. 添加折叠所有按钮
2. 添加视图切换按钮
3. 添加文件统计显示
4. 优化按钮布局

### 阶段 4: 键盘导航（中优先级）
1. 实现箭头键导航
2. 添加快捷键支持
3. 实现焦点管理
4. 添加键盘提示

### 阶段 5: 拖拽功能（低优先级）
1. 实现文件拖拽
2. 实现拖拽到文件夹
3. 添加拖拽视觉反馈
4. 实现拖拽排序

### 阶段 6: 高级功能（低优先级）
1. 文件信息显示
2. 多选文件
3. 批量操作
4. 收藏夹功能

---

## ✅ 验收标准

### 功能完整性
- ✅ 所有基础文件操作正常
- ⏳ 搜索功能正常工作
- ⏳ 排序功能正常工作
- ⏳ 键盘导航流畅
- ⏳ 拖拽功能稳定

### UI/UX 质量
- ✅ 与 Obsidian 视觉风格一致
- ✅ 动画流畅自然
- ✅ 响应速度快
- ⏳ 键盘导航友好
- ⏳ 无障碍支持完善

### 性能要求
- ⏳ 1000+ 文件流畅显示
- ⏳ 搜索响应 < 100ms
- ⏳ 排序响应 < 50ms
- ⏳ 内存占用合理

### 测试覆盖
- ⏳ 所有功能有单元测试
- ⏳ 边界情况测试
- ⏳ 性能测试
- ⏳ 无障碍测试

---

## 🔍 Obsidian 侧边栏对比

| 功能 | Obsidian | A3Note | 状态 |
|------|----------|--------|------|
| 文件树 | ✅ | ✅ | 完成 |
| 搜索 | ✅ | ❌ | 待实现 |
| 排序 | ✅ | ❌ | 待实现 |
| 折叠所有 | ✅ | ❌ | 待实现 |
| 拖拽 | ✅ | ❌ | 待实现 |
| 键盘导航 | ✅ | ❌ | 待实现 |
| 上下文菜单 | ✅ | ✅ | 完成 |
| 文件统计 | ✅ | ❌ | 待实现 |
| 视图切换 | ✅ | ❌ | 待实现 |
| 文件信息 | ✅ | ❌ | 待实现 |

---

**分析完成日期**: 2026-03-23  
**下一步**: 实现搜索和排序功能
