# A3Note UI 测试指南

## ✅ 服务器已重新启动

- **状态**: 运行中
- **地址**: http://localhost:1420/
- **Vite 版本**: v4.5.14
- **启动时间**: 261ms

## 🎯 测试步骤

### 1. 访问应用

点击上方的 **"A3Note App"** 按钮打开浏览器预览

### 2. 打开开发者工具

- 按 `F12` 或 `Cmd+Option+I` (Mac)
- 切换到 **Console** 标签
- 清空控制台（点击 🚫 图标）

### 3. 测试文件显示功能

#### 步骤 A: 点击侧边栏文件

1. 在左侧侧边栏，点击 `README.md`
2. 观察控制台输出
3. 观察右侧编辑器区域

#### 预期结果

**控制台应该显示**:
```
[Sidebar] File clicked: {path: "/demo/README.md", name: "README.md", isDirectory: false}
[Sidebar] Calling onFileSelect
[App] handleFileSelect called with: {path: "/demo/README.md", ...}
[useFile] openFile called with: {path: "/demo/README.md", ...}
[useFile] Reading file: /demo/README.md
[useFile] File content loaded: # Welcome to A3Note...
[useFile] State updated with file: README.md content length: 50
[App] openFile completed
[Editor] Render - currentFile: README.md content length: 50
[Editor] Content update effect - viewRef: true content changed: true
[Editor] Updating editor content: # Welcome to A3Note...
[Editor] Content updated successfully
```

**编辑器应该显示**:
```
# Welcome to A3Note

This is a demo workspace.
```

### 4. 测试文件切换

1. 点击 `note1.md`
2. 观察编辑器内容变化
3. 点击 `note2.md`
4. 观察编辑器内容变化

#### 预期结果

- `note1.md` 显示: `# Note 1\n\nSample content for note 1.`
- `note2.md` 显示: `# Note 2\n\nSample content for note 2.`

### 5. 测试编辑功能

1. 在编辑器中点击任意位置
2. 输入一些文本
3. 观察内容是否显示

#### 预期结果

- 输入的文本应该立即显示在编辑器中
- 控制台应该显示 `[Editor] Render` 日志

## 🔍 如果看不到内容

### 检查控制台

查看是否有以下情况：

1. **没有任何日志**
   - 页面可能没有正确加载
   - 尝试硬刷新: `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)

2. **只有 [Sidebar] 日志**
   - 点击事件正常
   - 但后续处理失败
   - 检查是否有错误信息

3. **有 [Sidebar] 和 [App] 但没有 [useFile]**
   - openFile 函数可能没有被调用
   - 检查是否有错误信息

4. **有 [useFile] 但没有 [Editor]**
   - 状态更新可能失败
   - 编辑器可能没有正确渲染

5. **有所有日志但看不到内容**
   - 编辑器可能被 CSS 隐藏
   - 检查编辑器 DOM 元素

### 检查 DOM 元素

1. 在开发者工具中切换到 **Elements** 标签
2. 查找 `<div ref="editorRef">` 元素
3. 检查是否有 `.cm-content` 元素
4. 检查 `.cm-content` 是否有内容

## 📊 测试清单

- [ ] 访问应用成功
- [ ] 侧边栏显示文件列表
- [ ] 点击文件有控制台日志
- [ ] 编辑器显示文件内容
- [ ] 切换文件内容更新
- [ ] 编辑器可以输入文本
- [ ] 没有控制台错误

## 🐛 报告问题

如果测试失败，请提供：

1. **控制台日志** - 截图或复制文本
2. **错误信息** - 红色的错误文字
3. **DOM 结构** - Elements 标签的截图
4. **具体步骤** - 你做了什么操作

## 🎯 成功标准

测试成功的标志：

- ✅ 点击文件后看到控制台日志
- ✅ 编辑器显示文件内容
- ✅ 切换文件时内容更新
- ✅ 可以在编辑器中输入文本
- ✅ 没有控制台错误

**开始测试吧！** 🚀
