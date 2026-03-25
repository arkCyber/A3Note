# A3Note 新功能使用指南

本指南介绍最新实现的功能及其使用方法。

---

## 🎯 新增功能概览

### 1. Editor API - 编辑器编程接口
### 2. Notice API - 通知系统
### 3. Modal API - 模态对话框
### 4. Embed/Transclusion - 嵌入笔记
### 5. Block References - 块引用
### 6. Workspace Manager - 工作区管理

---

## 📝 1. Editor API

### 基础用法

```typescript
import { Editor } from '@/plugins/api';

// 获取编辑器实例（在插件中）
const editor = this.app.workspace.activeEditor;

// 获取/设置内容
const content = editor.getValue();
editor.setValue('新内容');

// 获取/替换选择
const selection = editor.getSelection();
editor.replaceSelection('**加粗**');

// 光标操作
const cursor = editor.getCursor();
editor.setCursor({ line: 0, ch: 0 });

// 行操作
const line = editor.getLine(0);
editor.setLine(0, '新的第一行');

// 范围操作
const text = editor.getRange(
  { line: 0, ch: 0 },
  { line: 0, ch: 5 }
);
```

### 插件示例

```typescript
class BoldTextPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: 'bold-selection',
      name: '加粗选中文本',
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection) {
          editor.replaceSelection(`**${selection}**`);
        }
      }
    });
  }
}
```

---

## 🔔 2. Notice API

### 基础通知

```typescript
import { Notice } from '@/plugins/api';

// 显示通知（5秒后自动消失）
new Notice('操作完成');

// 自定义超时时间（毫秒）
new Notice('正在处理...', 3000);

// 永久显示（需手动关闭）
const notice = new Notice('重要消息', 0);
// 稍后关闭
notice.hide();
```

### 类型化通知

```typescript
import { 
  noticeSuccess, 
  noticeError, 
  noticeWarning, 
  noticeInfo 
} from '@/plugins/api';

// 成功通知（绿色）
noticeSuccess('文件已保存');

// 错误通知（红色）
noticeError('保存失败，请重试');

// 警告通知（橙色）
noticeWarning('文件已存在');

// 信息通知（蓝色）
noticeInfo('正在同步...');
```

### 动态更新通知

```typescript
const notice = new Notice('正在处理...', 0);

// 更新消息
setTimeout(() => {
  notice.setMessage('处理中 50%...');
}, 1000);

setTimeout(() => {
  notice.setMessage('完成！');
  setTimeout(() => notice.hide(), 1000);
}, 2000);
```

---

## 🪟 3. Modal API

### 基础 Modal

```typescript
import { Modal, App } from '@/plugins/api';

class MyModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    // 设置标题
    this.setTitle('我的对话框');
    
    // 添加内容
    const { contentEl } = this;
    contentEl.createEl('p', { text: '这是对话框内容' });
    
    // 添加按钮
    const button = contentEl.createEl('button', { text: '确定' });
    button.onclick = () => {
      console.log('按钮被点击');
      this.close();
    };
  }

  onClose() {
    // 清理工作
    console.log('对话框已关闭');
  }
}

// 使用
const modal = new MyModal(this.app);
modal.open();
```

### 建议选择器 Modal

```typescript
import { SuggestModal, App } from '@/plugins/api';

interface Item {
  name: string;
  value: string;
}

class ItemSuggestModal extends SuggestModal<Item> {
  private items: Item[];
  
  constructor(app: App, items: Item[]) {
    super(app);
    this.items = items;
  }

  getSuggestions(query: string): Item[] {
    return this.items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(item: Item, el: HTMLElement): void {
    el.createEl('div', { text: item.name });
  }

  onChooseSuggestion(item: Item): void {
    console.log('选择了:', item);
    new Notice(`已选择: ${item.name}`);
  }
}

// 使用
const items = [
  { name: '选项1', value: 'opt1' },
  { name: '选项2', value: 'opt2' },
];
const modal = new ItemSuggestModal(this.app, items);
modal.open();
```

### 模糊搜索 Modal

```typescript
import { FuzzySuggestModal, App } from '@/plugins/api';

class FileSuggestModal extends FuzzySuggestModal<string> {
  private files: string[];
  
  constructor(app: App, files: string[]) {
    super(app);
    this.files = files;
  }

  getItems(): string[] {
    return this.files;
  }

  getItemText(item: string): string {
    return item;
  }

  renderSuggestion(item: string, el: HTMLElement): void {
    el.createEl('div', { text: item });
  }

  onChooseSuggestion(item: string): void {
    console.log('打开文件:', item);
  }
}
```

---

## 📎 4. Embed/Transclusion - 嵌入笔记

### 语法

```markdown
# 嵌入整个笔记
![[笔记名称]]

# 嵌入特定章节
![[笔记名称#章节标题]]

# 嵌入特定块
![[笔记名称#^block-id]]
```

### 示例

```markdown
# 项目文档

## 概述
![[项目概述]]

## 技术栈
![[技术文档#技术栈]]

## 重要说明
![[重要事项#^warning-123]]
```

### 配置嵌入加载器

```typescript
import { createEmbedExtension } from '@/extensions/embedExtension';

const embedExt = createEmbedExtension({
  onLoadEmbed: async (path, heading, blockId) => {
    // 加载文件
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) return null;
    
    const content = await this.app.vault.read(file);
    
    // 提取章节
    if (heading) {
      return extractHeading(content, heading);
    }
    
    // 提取块
    if (blockId) {
      return extractBlock(content, blockId);
    }
    
    return content;
  }
});
```

### 特性

- ✅ 实时渲染嵌入内容
- ✅ 支持章节嵌入
- ✅ 支持块引用嵌入
- ✅ 点击链接在新窗格打开
- ✅ 最大高度限制和滚动
- ✅ 加载错误处理

---

## 🔗 5. Block References - 块引用

### 定义块 ID

在任意段落末尾添加 `^block-id`：

```markdown
这是一段重要的文本 ^important-note

这是另一段文本 ^key-point
```

### 引用块

```markdown
# 在其他笔记中引用
[[笔记名称#^important-note]]

# 带别名的引用
[[笔记名称#^important-note|重要说明]]
```

### 自动生成块 ID

```typescript
import { insertBlockId } from '@/extensions/blockRefExtension';

// 在光标位置插入随机块 ID
insertBlockId(editorView);
// 结果: ^abc123
```

### 块 ID 特性

- ✅ 点击块 ID 复制到剪贴板
- ✅ 块引用链接可点击导航
- ✅ 自动生成 6 位随机 ID
- ✅ 视觉样式优化

### 完整示例

```markdown
# 会议记录.md

## 决策事项
我们决定使用 React 作为前端框架 ^decision-001

## 行动项
- 张三负责搭建项目架构 ^action-001
- 李四负责设计数据库 ^action-002

---

# 项目总结.md

## 技术决策
根据会议记录 [[会议记录#^decision-001]]，我们选择了 React。

## 待办事项
参考 [[会议记录#^action-001|架构任务]] 和 [[会议记录#^action-002|数据库设计]]。
```

---

## 💼 6. Workspace Manager - 工作区管理

### 保存工作区

```typescript
import { workspaceManager } from '@/services/workspace-manager';

// 保存当前工作区
await workspaceManager.saveWorkspace('开发环境', {
  openFiles: [
    '/projects/main.ts',
    '/projects/utils.ts',
  ],
  activeFile: '/projects/main.ts',
  sidebarOpen: true,
  sidebarWidth: 300,
  previewOpen: false,
  splitLayout: null,
  pinnedFiles: ['/projects/README.md'],
});
```

### 加载工作区

```typescript
// 加载工作区
const layout = await workspaceManager.loadWorkspace('开发环境');

if (layout) {
  // 恢复打开的文件
  for (const filePath of layout.openFiles) {
    await openFile(filePath);
  }
  
  // 恢复活动文件
  if (layout.activeFile) {
    await setActiveFile(layout.activeFile);
  }
  
  // 恢复侧边栏状态
  setSidebarOpen(layout.sidebarOpen);
  setSidebarWidth(layout.sidebarWidth);
}
```

### 工作区操作

```typescript
// 列出所有工作区
const workspaces = workspaceManager.listWorkspaces();
console.log('可用工作区:', workspaces.map(w => w.name));

// 删除工作区
await workspaceManager.deleteWorkspace('旧工作区');

// 重命名工作区
await workspaceManager.renameWorkspace('开发', '开发环境');

// 复制工作区
await workspaceManager.duplicateWorkspace('开发环境', '测试环境');

// 导出工作区
const json = workspaceManager.exportWorkspace('开发环境');
// 保存到文件或分享

// 导入工作区
await workspaceManager.importWorkspace(json);
```

### 自动保存

```typescript
// 自动保存当前工作区状态
await workspaceManager.autoSave({
  openFiles: getCurrentOpenFiles(),
  activeFile: getCurrentActiveFile(),
  sidebarOpen: isSidebarOpen(),
  sidebarWidth: getSidebarWidth(),
  previewOpen: isPreviewOpen(),
  splitLayout: getSplitLayout(),
  pinnedFiles: getPinnedFiles(),
});

// 恢复自动保存的工作区
const autoSaved = await workspaceManager.loadAutoSave();
```

### UI 集成示例

```typescript
// 工作区选择器组件
function WorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState([]);
  
  useEffect(() => {
    setWorkspaces(workspaceManager.listWorkspaces());
  }, []);
  
  const handleLoad = async (name: string) => {
    const layout = await workspaceManager.loadWorkspace(name);
    if (layout) {
      restoreWorkspace(layout);
      noticeSuccess(`已加载工作区: ${name}`);
    }
  };
  
  return (
    <div>
      {workspaces.map(ws => (
        <button key={ws.name} onClick={() => handleLoad(ws.name)}>
          {ws.name}
        </button>
      ))}
    </div>
  );
}
```

---

## 🎨 样式定制

所有新组件的样式都在 `src/styles/plugins.css` 中定义。

### CSS 变量

```css
/* 自定义通知颜色 */
:root {
  --notice-success: #4caf50;
  --notice-error: #f44336;
  --notice-warning: #ff9800;
  --notice-info: #2196f3;
}

/* 自定义模态框 */
:root {
  --modal-backdrop: rgba(0, 0, 0, 0.5);
  --modal-border-radius: 8px;
}
```

### 自定义样式

```css
/* 自定义通知位置 */
.notice-container {
  top: 20px;
  right: 20px;
  /* 改为左侧 */
  left: 20px;
  right: auto;
}

/* 自定义嵌入样式 */
.cm-embed {
  border-color: var(--interactive-accent);
  background: var(--background-primary-alt);
}
```

---

## 🔧 集成到现有项目

### 1. 导入 CSS

```typescript
// src/main.tsx 或 src/App.tsx
import './styles/plugins.css';
```

### 2. 注册编辑器扩展

```typescript
// src/components/Editor.tsx
import { embedExtension, embedTheme } from '../extensions/embedExtension';
import { blockRefExtension, blockRefTheme, blockIdState } from '../extensions/blockRefExtension';

const extensions = [
  // ... 现有扩展
  embedExtension,
  embedTheme,
  blockRefExtension,
  blockRefTheme,
  blockIdState,
];
```

### 3. 使用插件 API

```typescript
// 在插件中
import { Editor, Notice, Modal } from '@/plugins/api';

class MyPlugin extends Plugin {
  onload() {
    // 使用 Editor API
    this.registerCommand({
      id: 'my-command',
      editorCallback: (editor: Editor) => {
        // 编辑器操作
      }
    });
    
    // 显示通知
    new Notice('插件已加载');
  }
}
```

---

## 📚 更多资源

- **完整审计报告**: `OBSIDIAN_GAP_ANALYSIS.md`
- **实施总结**: `IMPLEMENTATION_SUMMARY.md`
- **API 文档**: `src/plugins/api/`
- **扩展文档**: `src/extensions/`

---

## 🐛 故障排除

### 通知不显示

确保已导入 CSS：
```typescript
import './styles/plugins.css';
```

### 嵌入内容不加载

配置嵌入加载器：
```typescript
const embedExt = createEmbedExtension({
  onLoadEmbed: async (path, heading, blockId) => {
    // 实现内容加载逻辑
  }
});
```

### 工作区无法保存

检查 localStorage 是否可用：
```typescript
if (typeof localStorage !== 'undefined') {
  // 可以使用工作区管理
}
```

---

**最后更新**: 2026年3月24日  
**版本**: 1.0
