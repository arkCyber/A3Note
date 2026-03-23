#!/usr/bin/env node

/**
 * A3Note Feature Audit Script
 * 自动检测所有功能模块的问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('🔍 A3Note 功能审计开始...\n');

// 1. 检查关键组件文件
console.log('📦 1. 检查组件文件...');
const components = [
  'src/App.tsx',
  'src/components/Toolbar.tsx',
  'src/components/Sidebar.tsx',
  'src/components/Editor.tsx',
  'src/components/PreviewPane.tsx',
  'src/components/SearchPanel.tsx',
  'src/components/CommandPalette.tsx',
  'src/components/Settings.tsx',
  'src/components/PluginManager.tsx',
  'src/components/PluginMarketplace.tsx',
  'src/components/StatusBar.tsx',
  'src/components/WelcomeScreen.tsx',
  'src/components/ThemeToggle.tsx',
];

components.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✓ ${file} 存在`);
  } else {
    results.failed.push(`✗ ${file} 缺失`);
  }
});

// 2. 检查 Hooks
console.log('🪝 2. 检查 Hooks...');
const hooks = [
  'src/hooks/useWorkspace.ts',
  'src/hooks/useFile.ts',
  'src/hooks/useSearch.ts',
  'src/hooks/useKeyboard.ts',
  'src/hooks/usePlugins.ts',
  'src/hooks/useTheme.ts',
];

hooks.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✓ ${file} 存在`);
  } else {
    results.failed.push(`✗ ${file} 缺失`);
  }
});

// 3. 检查插件系统
console.log('🔌 3. 检查插件系统...');
const plugins = [
  'src/plugins/api/App.ts',
  'src/plugins/types/plugin.ts',
  'src/plugins/types/manifest.ts',
  'src/plugins/loader/PluginManager.ts',
  'src/plugins/samples/SamplePlugin.ts',
  'src/plugins/samples/WordCountPlugin.ts',
  'src/plugins/samples/QuickSwitcherPlugin.ts',
  'src/plugins/samples/BacklinksPlugin.ts',
  'src/plugins/samples/TagsPlugin.ts',
];

plugins.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✓ ${file} 存在`);
  } else {
    results.failed.push(`✗ ${file} 缺失`);
  }
});

// 4. 检查 API 文件
console.log('🌐 4. 检查 API 文件...');
const apis = [
  'src/api/tauri.ts',
];

apis.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.passed.push(`✓ ${file} 存在`);
    
    // 检查是否有浏览器模式支持
    if (content.includes('isTauri')) {
      results.passed.push(`✓ ${file} 支持浏览器模式`);
    } else {
      results.warnings.push(`⚠ ${file} 可能缺少浏览器模式支持`);
    }
  } else {
    results.failed.push(`✗ ${file} 缺失`);
  }
});

// 5. 检查 App.tsx 中的关键功能
console.log('⚙️  5. 检查 App.tsx 功能绑定...');
const appPath = path.join(process.cwd(), 'src/App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf-8');
  
  const features = [
    { name: '侧边栏切换', pattern: /setSidebarOpen/ },
    { name: '搜索面板', pattern: /setSearchOpen/ },
    { name: '命令面板', pattern: /setCommandPaletteOpen/ },
    { name: '预览面板', pattern: /setPreviewOpen/ },
    { name: '设置面板', pattern: /setSettingsOpen/ },
    { name: '插件管理器', pattern: /setPluginManagerOpen/ },
    { name: '插件市场', pattern: /setPluginMarketplaceOpen/ },
    { name: '新建文件', pattern: /handleNewFile/ },
    { name: '保存文件', pattern: /saveFile/ },
    { name: '打开工作区', pattern: /openWorkspace/ },
    { name: '键盘快捷键', pattern: /useKeyboard/ },
  ];
  
  features.forEach(({ name, pattern }) => {
    if (pattern.test(appContent)) {
      results.passed.push(`✓ ${name} 功能已实现`);
    } else {
      results.failed.push(`✗ ${name} 功能缺失`);
    }
  });
}

// 6. 检查国际化文件
console.log('🌍 6. 检查国际化文件...');
const i18nFiles = [
  'src/i18n/locales/zh-CN/common.json',
  'src/i18n/locales/zh-CN/toolbar.json',
  'src/i18n/locales/zh-CN/sidebar.json',
  'src/i18n/locales/en-US/common.json',
  'src/i18n/locales/en-US/toolbar.json',
  'src/i18n/locales/ja-JP/common.json',
];

i18nFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✓ ${file} 存在`);
  } else {
    results.warnings.push(`⚠ ${file} 缺失（可能影响多语言）`);
  }
});

// 7. 检查样式文件
console.log('🎨 7. 检查样式配置...');
const styleFiles = [
  'src/styles/index.css',
  'tailwind.config.js',
  'postcss.config.js',
];

styleFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✓ ${file} 存在`);
  } else {
    results.failed.push(`✗ ${file} 缺失`);
  }
});

// 8. 检查类型定义
console.log('📝 8. 检查类型定义...');
const typesPath = path.join(process.cwd(), 'src/types/index.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  
  const types = [
    'FileItem',
    'FileContent',
    'SearchResult',
    'WorkspaceState',
  ];
  
  types.forEach(type => {
    if (typesContent.includes(type)) {
      results.passed.push(`✓ 类型 ${type} 已定义`);
    } else {
      results.warnings.push(`⚠ 类型 ${type} 可能缺失`);
    }
  });
}

// 输出结果
console.log('\n' + '='.repeat(60));
console.log('📊 审计结果汇总');
console.log('='.repeat(60));

console.log(`\n✅ 通过: ${results.passed.length}`);
console.log(`❌ 失败: ${results.failed.length}`);
console.log(`⚠️  警告: ${results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ 失败项目:');
  results.failed.forEach(item => console.log(`  ${item}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  警告项目:');
  results.warnings.forEach(item => console.log(`  ${item}`));
}

console.log('\n' + '='.repeat(60));

// 生成审计报告
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    total: results.passed.length + results.failed.length + results.warnings.length
  },
  details: results
};

const reportPath = path.join(process.cwd(), 'audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 详细报告已保存到: ${reportPath}`);

// 退出码
process.exit(results.failed.length > 0 ? 1 : 0);
