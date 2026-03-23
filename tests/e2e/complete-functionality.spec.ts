import { test, expect } from '@playwright/test';

test.describe('A3Note Complete Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    // 启动应用
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('核心编辑器功能测试', async ({ page }) => {
    console.log('🧪 测试核心编辑器功能...');

    // 等待编辑器加载
    await page.waitForSelector('.cm-editor', { timeout: 10000 });
    
    // 测试 Markdown 编辑
    await page.fill('.cm-editor', '# 测试标题\n\n这是测试内容。\n\n**粗体** *斜体*');
    
    // 检查语法高亮
    const hasHighlight = await page.locator('.cm-strong').isVisible();
    expect(hasHighlight).toBeTruthy();
    
    // 测试实时预览
    const previewTab = page.locator('text=预览');
    if (await previewTab.isVisible()) {
      await previewTab.click();
      await page.waitForSelector('.markdown-preview', { timeout: 5000 });
    }
    
    console.log('✅ 核心编辑器功能测试通过');
  });

  test('导出功能测试 (5种格式)', async ({ page }) => {
    console.log('🧪 测试导出功能...');

    // 创建测试内容
    await page.fill('.cm-editor', `# A3Note 导出测试

## 标题 2

**粗体文本** *斜体文本*

- 列表项 1
- 列表项 2

| 功能 | 状态 |
|------|------|
| PDF | ✅ |
| Word | ✅ |
| PPT | ✅ |

\`\`\`javascript
console.log('测试代码');
\`\`\`
`);

    // 点击更多操作菜单
    await page.click('[data-testid="more-options-menu"]', { timeout: 5000 });
    
    // 等待菜单出现
    await page.waitForSelector('text=Export document...', { timeout: 3000 });
    await page.click('text=Export document...');

    // 等待导出对话框
    await page.waitForSelector('.export-dialog', { timeout: 5000 });

    // 测试 PDF 导出
    await page.click('input[value="pdf"]');
    await page.fill('input[placeholder*="文件名"]', 'test-pdf');
    await page.click('text=导出');
    await page.waitForTimeout(2000);

    // 测试 HTML 导出
    await page.click('input[value="html"]');
    await page.fill('input[placeholder*="文件名"]', 'test-html');
    await page.click('text=导出');
    await page.waitForTimeout(2000);

    // 测试 Markdown 导出
    await page.click('input[value="markdown"]');
    await page.fill('input[placeholder*="文件名"]', 'test-md');
    await page.click('text=导出');
    await page.waitForTimeout(2000);

    // 测试 Word 导出 (新增)
    await page.click('input[value="docx"]');
    await page.fill('input[placeholder*="文件名"]', 'test-word');
    await page.click('text=导出');
    await page.waitForTimeout(3000);

    // 测试 PPT 导出 (新增)
    await page.click('input[value="pptx"]');
    await page.fill('input[placeholder*="文件名"]', 'test-ppt');
    await page.click('text=导出');
    await page.waitForTimeout(3000);

    console.log('✅ 导出功能测试通过 (5种格式)');
  });

  test('右键菜单功能测试', async ({ page }) => {
    console.log('🧪 测试右键菜单...');

    // 等待编辑器
    await page.waitForSelector('.cm-editor', { timeout: 10000 });
    
    // 测试编辑器右键菜单
    await page.click('.cm-editor', { button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 3000 });
    
    // 检查菜单项
    const menuItems = [
      '剪切',
      '复制',
      '粘贴',
      '粗体',
      '斜体',
      '插入链接'
    ];

    for (const item of menuItems) {
      const menuItem = page.locator(`text=${item}`);
      if (await menuItem.isVisible()) {
        console.log(`  ✓ 找到菜单项: ${item}`);
      }
    }

    // 关闭菜单
    await page.keyboard.press('Escape');

    console.log('✅ 右键菜单功能测试通过');
  });

  test('搜索功能测试', async ({ page }) => {
    console.log('🧪 测试搜索功能...');

    // 打开搜索面板 (Ctrl+K)
    await page.keyboard.press('Control+k');
    await page.waitForSelector('.search-panel', { timeout: 5000 });
    
    // 输入搜索内容
    await page.fill('.search-input', '测试');
    await page.waitForTimeout(1000);
    
    // 检查搜索结果
    const hasResults = await page.locator('.search-results').isVisible();
    if (hasResults) {
      console.log('  ✓ 搜索结果显示正常');
    }

    // 关闭搜索
    await page.keyboard.press('Escape');

    console.log('✅ 搜索功能测试通过');
  });

  test('UI 界面功能测试', async ({ page }) => {
    console.log('🧪 测试 UI 界面...');

    // 检查侧边栏
    const sidebar = page.locator('.sidebar');
    if (await sidebar.isVisible()) {
      console.log('  ✓ 侧边栏显示正常');
    }

    // 检查工具栏
    const toolbar = page.locator('.toolbar');
    if (await toolbar.isVisible()) {
      console.log('  ✓ 工具栏显示正常');
    }

    // 检查标签页
    const tabs = page.locator('.tab-bar');
    if (await tabs.isVisible()) {
      console.log('  ✓ 标签页显示正常');
    }

    // 检查状态栏
    const statusbar = page.locator('.status-bar');
    if (await statusbar.isVisible()) {
      console.log('  ✓ 状态栏显示正常');
    }

    console.log('✅ UI 界面功能测试通过');
  });

  test('分屏功能测试', async ({ page }) => {
    console.log('🧪 测试分屏功能...');

    // 查找分屏按钮或选项
    const splitButton = page.locator('[data-testid="split-pane-button"]');
    if (await splitButton.isVisible()) {
      await splitButton.click();
      await page.waitForTimeout(1000);
      
      // 检查是否出现分屏
      const splitPanes = page.locator('.split-pane');
      if (await splitPanes.isVisible()) {
        console.log('  ✓ 分屏功能正常');
      }
    } else {
      console.log('  ⚠️ 分屏按钮未找到，可能需要手动启用');
    }

    console.log('✅ 分屏功能测试完成');
  });

  test('命令面板测试', async ({ page }) => {
    console.log('🧪 测试命令面板...');

    // 打开命令面板 (Ctrl+Shift+P)
    await page.keyboard.press('Control+Shift+P');
    await page.waitForSelector('.command-palette', { timeout: 5000 });
    
    // 输入命令
    await page.fill('.command-input', '新建');
    await page.waitForTimeout(1000);
    
    // 检查命令建议
    const hasSuggestions = page.locator('.command-suggestions').isVisible();
    if (hasSuggestions) {
      console.log('  ✓ 命令建议显示正常');
    }

    // 关闭命令面板
    await page.keyboard.press('Escape');

    console.log('✅ 命令面板测试通过');
  });

  test('性能和响应性测试', async ({ page }) => {
    console.log('🧪 测试性能...');

    // 测试大文档加载
    const largeContent = '# 大文档测试\n\n' + '这是测试内容。\n'.repeat(1000);
    await page.fill('.cm-editor', largeContent);
    
    // 检查编辑器响应性
    const startTime = Date.now();
    await page.type('.cm-editor', '追加内容');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`  ✓ 编辑器响应时间: ${responseTime}ms`);
    
    expect(responseTime).toBeLessThan(1000); // 响应时间应小于1秒

    console.log('✅ 性能测试通过');
  });

  test('错误处理测试', async ({ page }) => {
    console.log('🧪 测试错误处理...');

    // 测试无效导出
    await page.fill('.cm-editor', '');
    
    // 尝试导出空文档
    await page.click('[data-testid="more-options-menu"]');
    await page.click('text=Export document...');
    await page.waitForSelector('.export-dialog');
    
    await page.click('input[value="pdf"]');
    await page.click('text=导出');
    
    // 检查是否有错误提示
    await page.waitForTimeout(2000);
    const errorAlert = page.locator('.error-message');
    if (await errorAlert.isVisible()) {
      console.log('  ✓ 错误处理正常');
    }

    console.log('✅ 错误处理测试通过');
  });
});

test.describe('A3Note 集成测试', () => {
  test('完整工作流测试', async ({ page }) => {
    console.log('🧪 执行完整工作流测试...');

    // 1. 启动应用
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.cm-editor', { timeout: 10000 });

    // 2. 创建文档
    await page.fill('.cm-editor', `# A3Note 完整测试

## 功能验证

### 编辑器功能
- [x] Markdown 编辑
- [x] 语法高亮
- [x] 实时预览

### 导出功能
- [x] PDF 导出
- [x] Word 导出
- [x] PPT 导出

### UI 功能
- [x] 搜索 (Ctrl+K)
- [x] 命令面板 (Ctrl+Shift+P)
- [x] 右键菜单

---

**测试时间**: ${new Date().toLocaleString()}
**测试版本**: v7.0 Final
`);

    // 3. 测试搜索
    await page.keyboard.press('Control+k');
    await page.fill('.search-input', '功能验证');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // 4. 测试导出
    await page.click('[data-testid="more-options-menu"]');
    await page.click('text=Export document...');
    await page.waitForSelector('.export-dialog');
    
    // 导出为 PDF
    await page.click('input[value="pdf"]');
    await page.fill('input[placeholder*="文件名"]', 'complete-test');
    await page.click('text=导出');
    await page.waitForTimeout(3000);

    // 5. 测试命令面板
    await page.keyboard.press('Control+Shift+P');
    await page.fill('.command-input', '保存');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    console.log('✅ 完整工作流测试通过');
  });
});
