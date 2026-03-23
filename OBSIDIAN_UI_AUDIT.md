# A3Note UI 审计报告 - Obsidian 对齐

**审计日期**: 2026-03-22  
**目标**: 对齐 Obsidian 的 UI 设计和交互模式  
**状态**: 📊 审计中

---

## 📋 Obsidian UI 标准设计

### 主要 UI 元素

1. **Ribbon** - 左侧图标栏
   - 位置：左侧边缘
   - 功能：常用命令的快速访问
   - 特点：即使侧边栏关闭也保持可见
   - 默认图标：新建文件、搜索、设置、帮助等

2. **Sidebar** - 左侧文件浏览器
   - 位置：左侧
   - 功能：文件和文件夹管理
   - 特点：可折叠
   - 内容：文件树、快速创建按钮

3. **Command Palette** - 命令面板
   - 快捷键：`⌘+P` (Mac) / `Ctrl+P` (Windows)
   - 功能：快速访问所有命令
   - 特点：搜索、过滤、快捷键提示

4. **Status Bar** - 底部状态栏
   - 位置：底部
   - 功能：显示状态信息
   - 内容：当前文件、字符数、模式等

5. **Tab Bar** - 标签栏
   - 位置：编辑器顶部
   - 功能：多标签管理
   - 特点：可拖拽、可关闭

---

## 🔍 A3Note 当前 UI 审计

### 1. Toolbar (顶部工具栏)

**当前实现**: `src/components/Toolbar.tsx`

**包含的按钮**:
- ✅ 侧边栏切换 (Menu 图标)
- ✅ 打开工作区 (FolderOpen 图标)
- ✅ 新建文件 (FileText 图标)
- ✅ 保存 (Save 图标)
- ✅ 搜索 (Search 图标)
- ✅ 主题切换 (ThemeToggle)
- ✅ 插件市场 (Package 图标)
- ✅ 设置 (Settings 图标)

**与 Obsidian 的差异**:
- ❌ Obsidian 使用 Ribbon（左侧图标栏）而不是顶部 Toolbar
- ❌ 顶部 Toolbar 不是 Obsidian 的标准设计
- ✅ 按钮功能对齐

**建议**:
- 🔄 将顶部 Toolbar 改为 Ribbon（左侧图标栏）
- 🔄 移除顶部 Toolbar，或改为 Tab Bar

### 2. Sidebar (侧边栏)

**当前实现**: `src/components/Sidebar.tsx`

**包含的功能**:
- ✅ 文件树显示
- ✅ 快速创建按钮（文件 + 文件夹）
- ✅ 右键菜单
- ✅ 刷新按钮
- ✅ 单击打开文件（已对齐）
- ✅ 默认"未命名"文件（已对齐）
- ✅ 第一行文字作为文件名（已对齐）

**与 Obsidian 的差异**:
- ✅ 文件树结构对齐
- ✅ 右键菜单对齐
- ✅ 快速创建按钮对齐
- ⚠️ 缺少文件图标自定义
- ⚠️ 缺少标签显示

**建议**:
- ✅ 保留当前实现（已对齐）
- ➕ 添加文件图标自定义功能
- ➕ 添加标签显示

### 3. Command Palette (命令面板)

**当前实现**: `src/components/CommandPalette.tsx`

**包含的命令**:
- ✅ 新建文件
- ✅ 新建文件（自定义名称）
- ✅ 新建文件夹
- ✅ 保存文件
- ✅ 打开工作区
- ✅ 切换侧边栏
- ✅ 切换搜索
- ✅ 切换预览

**与 Obsidian 的差异**:
- ✅ 功能对齐
- ✅ 快捷键对齐（⌘+P）
- ⚠️ 缺少文件搜索
- ⚠️ 缺少标签搜索
- ⚠️ 缺少命令分类

**建议**:
- ✅ 保留当前实现
- ➕ 添加文件搜索功能
- ➕ 添加标签搜索功能
- ➕ 添加命令分类

### 4. Status Bar (状态栏)

**当前实现**: `src/components/StatusBar.tsx`

**包含的信息**:
- ✅ 当前文件名
- ✅ 字符数
- ✅ 行数
- ✅ 保存状态

**与 Obsidian 的差异**:
- ✅ 功能对齐
- ⚠️ 缺少模式显示（编辑/预览）
- ⚠️ 缺少工作区路径

**建议**:
- ✅ 保留当前实现
- ➕ 添加模式显示
- ➕ 添加工作区路径

---

## 🎯 对齐 Obsidian 的改进计划

### 优先级 1: 核心改进

#### 1.1 添加 Ribbon（左侧图标栏）

**目标**: 将顶部 Toolbar 改为 Ribbon（左侧图标栏）

**实现**:
- 创建 `src/components/Ribbon.tsx`
- 包含核心功能图标
- 垂直布局
- 固定在左侧边缘

**图标按钮**:
- 新建文件 (FilePlus)
- 搜索 (Search)
- 设置 (Settings)
- 帮助 (Help)

**代码结构**:
```typescript
export default function Ribbon() {
  return (
    <div className="w-12 bg-secondary border-r border-border flex flex-col items-center py-2 gap-2">
      <RibbonButton icon={<FilePlus />} onClick={handleNewFile} />
      <RibbonButton icon={<Search />} onClick={handleSearch} />
      <RibbonButton icon={<Settings />} onClick={handleSettings} />
      <RibbonButton icon={<Help />} onClick={handleHelp} />
    </div>
  );
}
```

#### 1.2 移除顶部 Toolbar

**目标**: 移除顶部 Toolbar，使用 Ribbon 代替

**实现**:
- 修改 `src/App.tsx`
- 移除 Toolbar 组件
- 添加 Ribbon 组件

#### 1.3 添加 Tab Bar（标签栏）

**目标**: 添加多标签支持

**实现**:
- 创建 `src/components/TabBar.tsx`
- 显示打开的文件标签
- 支持标签切换、关闭

### 优先级 2: 功能增强

#### 2.1 增强 Command Palette

**目标**: 添加文件搜索和标签搜索

**实现**:
- 修改 `src/components/CommandPalette.tsx`
- 添加文件搜索模式
- 添加标签搜索模式
- 添加命令分类

#### 2.2 增强 Sidebar

**目标**: 添加文件图标和标签显示

**实现**:
- 修改 `src/components/Sidebar.tsx`
- 添加文件图标支持
- 添加标签显示
- 添加图标自定义功能

#### 2.3 增强 Status Bar

**目标**: 添加模式显示和工作区路径

**实现**:
- 修改 `src/components/StatusBar.tsx`
- 添加编辑/预览模式显示
- 添加工作区路径显示

### 优先级 3: 交互优化

#### 3.1 添加键盘快捷键

**目标**: 完善键盘快捷键

**快捷键**:
- ⌘+P - 命令面板
- ⌘+Shift+F - 全局搜索
- ⌘+G - 切换到下一个搜索结果
- ⌘+Shift+G - 切换到上一个搜索结果

#### 3.2 添加拖拽支持

**目标**: 添加文件拖拽功能

**实现**:
- 文件拖拽到文件夹
- 文件拖拽重新排序
- 标签拖拽

---

## 📊 对齐度评估

| UI 元素 | A3Note 当前 | Obsidian 标准 | 对齐度 | 优先级 |
|---------|------------|--------------|--------|--------|
| Ribbon | ❌ 不存在 | ✅ 存在 | 0% | 🔴 高 |
| Toolbar | ✅ 顶部 | ❌ 不推荐 | 50% | 🔴 高 |
| Sidebar | ✅ 左侧 | ✅ 左侧 | 90% | 🟡 中 |
| Command Palette | ✅ 存在 | ✅ 存在 | 80% | 🟡 中 |
| Status Bar | ✅ 存在 | ✅ 存在 | 85% | 🟢 低 |
| Tab Bar | ❌ 不存在 | ✅ 存在 | 0% | 🟡 中 |
| **总体对齐度** | | | **65%** | |

---

## 🔧 需要创建的文件

### 新组件

1. `src/components/Ribbon.tsx` - 左侧图标栏
2. `src/components/RibbonButton.tsx` - Ribbon 按钮组件
3. `src/components/TabBar.tsx` - 标签栏
4. `src/components/Tab.tsx` - 标签组件

### 修改的文件

1. `src/App.tsx` - 添加 Ribbon，移除 Toolbar
2. `src/components/CommandPalette.tsx` - 增强功能
3. `src/components/Sidebar.tsx` - 添加图标和标签
4. `src/components/StatusBar.tsx` - 添加更多信息

---

## 📝 实施步骤

### 阶段 1: 核心改进（1-2天）

1. ✅ 创建 Ribbon 组件
2. ✅ 创建 RibbonButton 组件
3. ✅ 修改 App.tsx，添加 Ribbon
4. ✅ 移除顶部 Toolbar
5. ✅ 测试 Ribbon 功能

### 阶段 2: 功能增强（2-3天）

1. ✅ 增强 Command Palette
2. ✅ 增强 Sidebar（图标 + 标签）
3. ✅ 增强 Status Bar
4. ✅ 测试所有增强功能

### 阶段 3: Tab Bar（1-2天）

1. ✅ 创建 TabBar 组件
2. ✅ 创建 Tab 组件
3. ✅ 添加标签管理逻辑
4. ✅ 测试标签功能

### 阶段 4: 测试和优化（1天）

1. ✅ 全面测试所有功能
2. ✅ 性能优化
3. ✅ 文档更新
4. ✅ 用户测试

---

## 🎯 成功标准

### UI 对齐度

- Ribbon: 100%
- Sidebar: 95%
- Command Palette: 95%
- Status Bar: 95%
- Tab Bar: 90%
- **总体对齐度**: 95%

### 功能完整性

- ✅ 所有 Obsidian 核心功能
- ✅ 所有键盘快捷键
- ✅ 所有交互模式
- ✅ 所有视觉元素

### 用户体验

- ⭐⭐⭐⭐⭐ - 与 Obsidian 一致的体验
- ⭐⭐⭐⭐⭐ - 流畅的交互
- ⭐⭐⭐⭐⭐ - 直观的操作

---

**审计完成日期**: 2026-03-22  
**审计版本**: 0.1.0  
**状态**: 📊 审计完成，待实施
