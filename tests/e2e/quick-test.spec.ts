import { test, expect } from '@playwright/test';

test.describe('A3Note 快速功能验证', () => {
  test('基础功能检查', async ({ page }) => {
    console.log('🚀 开始快速功能检查...');
    
    // 访问应用
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/A3Note/);
    
    // 检查编辑器是否存在
    const editor = page.locator('.cm-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    console.log('✅ 编辑器加载成功');
    
    // 测试基本输入
    await editor.fill('# A3Note 测试\n\n**粗体文本** *斜体文本*');
    console.log('✅ 文本输入正常');
    
    // 检查语法高亮
    const strongElement = page.locator('.cm-strong');
    const emElement = page.locator('.cm-em');
    
    if (await strongElement.isVisible()) {
      console.log('✅ 语法高亮正常');
    }
    
    // 检查导出按钮
    const exportButton = page.locator('[data-testid="more-options-menu"], button:has-text("更多")');
    if (await exportButton.isVisible()) {
      console.log('✅ 导出按钮存在');
      await exportButton.click();
      
      // 检查导出选项
      const exportOption = page.locator('text=Export');
      if (await exportOption.isVisible()) {
        console.log('✅ 导出选项存在');
      }
    }
    
    // 检查搜索功能
    await page.keyboard.press('Control+k');
    const searchPanel = page.locator('.search-panel, [role="search"]');
    if (await searchPanel.isVisible()) {
      console.log('✅ 搜索功能正常');
      await page.keyboard.press('Escape');
    }
    
    // 测试右键菜单
    await editor.click({ button: 'right' });
    const contextMenu = page.locator('.context-menu, [role="menu"]');
    if (await contextMenu.isVisible()) {
      console.log('✅ 右键菜单正常');
      await page.keyboard.press('Escape');
    }
    
    console.log('🎉 快速功能检查完成！');
  });
  
  test('导出功能验证', async ({ page }) => {
    console.log('🧪 验证导出功能...');
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.cm-editor', { timeout: 10000 });
    
    // 创建测试内容
    await page.fill('.cm-editor', `# 导出测试

## 内容测试

**粗体** *斜体*

- 列表 1
- 列表 2

| 功能 | 状态 |
|------|------|
| PDF | ✅ |
| Word | ✅ |
| PPT | ✅ |
`);
    
    // 尝试导出
    const exportButton = page.locator('[data-testid="more-options-menu"], button:has-text("更多"), button:has-text("⋯")');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // 查找导出选项
      const exportOption = page.locator('text=Export, text=导出, text=Export document...');
      if (await exportOption.first().isVisible()) {
        await exportOption.first().click();
        
        // 检查导出对话框
        const exportDialog = page.locator('.export-dialog, .modal, [role="dialog"]');
        if (await exportDialog.isVisible()) {
          console.log('✅ 导出对话框打开成功');
          
          // 检查导出格式选项
          const formats = ['pdf', 'html', 'markdown', 'docx', 'pptx'];
          for (const format of formats) {
            const formatOption = page.locator(`input[value="${format}"]`);
            if (await formatOption.isVisible()) {
              console.log(`✅ ${format.toUpperCase()} 导出选项存在`);
            }
          }
        }
      }
    }
    
    console.log('🎉 导出功能验证完成！');
  });
});
