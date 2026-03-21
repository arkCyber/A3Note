# 🌍 A3Note 国际化实现计划
## Internationalization (i18n) Implementation Plan

**创建时间**: 2026-03-21 17:28  
**目标**: 为 A3Note 添加完整的多语言支持  
**默认语言**: 中文（zh-CN）

---

## 📋 实现方案

### 技术选型

**使用库**: React i18next  
**原因**:
- ✅ React 生态最流行的 i18n 解决方案
- ✅ 支持动态语言切换
- ✅ 支持命名空间
- ✅ 支持插值和复数
- ✅ TypeScript 支持完善
- ✅ 轻量级，性能优秀

---

## 🌐 支持的语言

### 第一阶段（核心语言）

1. **中文（简体）** - zh-CN（默认）
2. **英语** - en-US
3. **日语** - ja-JP
4. **韩语** - ko-KR
5. **法语** - fr-FR
6. **德语** - de-DE
7. **西班牙语** - es-ES

### 第二阶段（扩展语言）

8. 俄语 - ru-RU
9. 葡萄牙语 - pt-BR
10. 意大利语 - it-IT

---

## 📁 文件结构

```
src/
├── i18n/
│   ├── index.ts              # i18n 配置
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json   # 通用翻译
│   │   │   ├── toolbar.json  # 工具栏
│   │   │   ├── sidebar.json  # 侧边栏
│   │   │   ├── settings.json # 设置
│   │   │   └── messages.json # 消息提示
│   │   ├── en-US/
│   │   │   └── ...
│   │   ├── ja-JP/
│   │   │   └── ...
│   │   └── ...
│   └── types.ts              # 类型定义
├── hooks/
│   └── useLanguage.ts        # 语言切换 Hook
└── components/
    └── LanguageSelector.tsx  # 语言选择器
```

---

## 🔧 实现步骤

### 1. 安装依赖

```bash
npm install i18next react-i18next
npm install -D @types/i18next
```

### 2. 创建 i18n 配置

**src/i18n/index.ts**:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入语言文件
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    lng: localStorage.getItem('a3note-language') || 'zh-CN',
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 3. 创建语言文件

**中文翻译结构**:
```json
{
  "common": {
    "appName": "A3Note",
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "rename": "重命名",
    "close": "关闭"
  },
  "toolbar": {
    "toggleSidebar": "切换侧边栏",
    "openWorkspace": "打开工作区",
    "newFile": "新建文件",
    "save": "保存",
    "search": "搜索",
    "settings": "设置"
  }
}
```

### 4. 更新组件

**使用翻译**:
```typescript
import { useTranslation } from 'react-i18next';

function Toolbar() {
  const { t } = useTranslation();
  
  return (
    <button title={t('toolbar.save')}>
      <Save />
    </button>
  );
}
```

### 5. 添加语言选择器

**Settings 中添加语言选项**:
```typescript
<select 
  value={i18n.language}
  onChange={(e) => i18n.changeLanguage(e.target.value)}
>
  <option value="zh-CN">中文（简体）</option>
  <option value="en-US">English</option>
  <option value="ja-JP">日本語</option>
</select>
```

---

## 🧪 测试计划

### 单元测试

1. ✅ 测试语言切换功能
2. ✅ 测试翻译键存在性
3. ✅ 测试默认语言加载
4. ✅ 测试语言持久化

### 集成测试

1. ✅ 测试所有组件的翻译
2. ✅ 测试动态语言切换
3. ✅ 测试缺失翻译的回退

---

## 📊 翻译覆盖范围

### 需要翻译的内容

1. **Toolbar** (7 个按钮)
2. **Sidebar** (标题、按钮、提示)
3. **Settings** (所有选项和标签)
4. **CommandPalette** (6 个命令)
5. **ContextMenu** (8 个菜单项)
6. **StatusBar** (状态信息)
7. **Messages** (提示消息、错误信息)
8. **WelcomeScreen** (欢迎文本)

**预计翻译条目**: ~150 条

---

## ✅ 验收标准

1. ✅ 支持至少 7 种语言
2. ✅ 默认语言为中文
3. ✅ 可在设置中切换语言
4. ✅ 语言选择持久化
5. ✅ 所有 UI 文本已翻译
6. ✅ 动态切换无需刷新
7. ✅ 完整的测试覆盖

---

## 🎯 实现优先级

### P0 - 核心功能（立即实现）

- ✅ i18n 基础架构
- ✅ 中文和英文翻译
- ✅ 语言切换功能
- ✅ 语言持久化

### P1 - 扩展功能（后续实现）

- ✅ 其他 5 种语言
- ✅ 完整测试
- ✅ 文档

---

**开始实施**: 2026-03-21 17:28
