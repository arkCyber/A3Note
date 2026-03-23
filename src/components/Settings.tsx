import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';

interface SettingsProps {
  onClose: () => void;
}

type SettingsTab = 
  | 'about'
  | 'editor'
  | 'files-links'
  | 'appearance'
  | 'hotkeys'
  | 'core-plugins'
  | 'community-plugins';

type CorePluginTab =
  | 'canvas'
  | 'backlinks'
  | 'command-palette'
  | 'daily-notes'
  | 'file-recovery'
  | 'graph-view'
  | 'note-composer'
  | 'outline'
  | 'page-preview'
  | 'properties'
  | 'publish'
  | 'random-note'
  | 'slash-commands'
  | 'slides'
  | 'sync'
  | 'tags'
  | 'templates'
  | 'unique-note-creator'
  | 'word-count'
  | 'workspaces';

export default function Settings({ onClose }: SettingsProps) {
  const { t, i18n } = useTranslation('settings');
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor');
  const [activePlugin, setActivePlugin] = useState<CorePluginTab | null>(null);

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？')) {
      resetSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-secondary border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">选项</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Main Sections */}
          <div className="px-2 space-y-1">
            <NavItem
              icon="ℹ️"
              label="关于"
              active={activeTab === 'about'}
              onClick={() => {
                setActiveTab('about');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="✏️"
              label="编辑器"
              active={activeTab === 'editor'}
              onClick={() => {
                setActiveTab('editor');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="📄"
              label="文件与链接"
              active={activeTab === 'files-links'}
              onClick={() => {
                setActiveTab('files-links');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="🎨"
              label="外观"
              active={activeTab === 'appearance'}
              onClick={() => {
                setActiveTab('appearance');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="⌨️"
              label="快捷键"
              active={activeTab === 'hotkeys'}
              onClick={() => {
                setActiveTab('hotkeys');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="🧩"
              label="组配串"
              active={activeTab === 'core-plugins'}
              onClick={() => {
                setActiveTab('core-plugins');
                setActivePlugin(null);
              }}
            />
            <NavItem
              icon="🔌"
              label="第三方插件"
              active={activeTab === 'community-plugins'}
              onClick={() => {
                setActiveTab('community-plugins');
                setActivePlugin(null);
              }}
            />
          </div>

          {/* Core Plugins Section */}
          {activeTab === 'core-plugins' && (
            <>
              <div className="px-4 py-2 mt-4 text-xs font-semibold text-foreground/60">
                核心插件
              </div>
              <div className="px-2 space-y-1">
                <NavItem
                  icon="🎯"
                  label="白板"
                  active={activePlugin === 'canvas'}
                  onClick={() => setActivePlugin('canvas')}
                  indent
                />
                <NavItem
                  icon="🔗"
                  label="笔记重组"
                  active={activePlugin === 'backlinks'}
                  onClick={() => setActivePlugin('backlinks')}
                  indent
                />
                <NavItem
                  icon="⌘"
                  label="反向链接"
                  active={activePlugin === 'command-palette'}
                  onClick={() => setActivePlugin('command-palette')}
                  indent
                />
                <NavItem
                  icon="📅"
                  label="快速切换"
                  active={activePlugin === 'daily-notes'}
                  onClick={() => setActivePlugin('daily-notes')}
                  indent
                />
                <NavItem
                  icon="💾"
                  label="命令面板"
                  active={activePlugin === 'file-recovery'}
                  onClick={() => setActivePlugin('file-recovery')}
                  indent
                />
                <NavItem
                  icon="🕸️"
                  label="模板"
                  active={activePlugin === 'graph-view'}
                  onClick={() => setActivePlugin('graph-view')}
                  indent
                />
                <NavItem
                  icon="📝"
                  label="日记"
                  active={activePlugin === 'daily-notes'}
                  onClick={() => setActivePlugin('daily-notes')}
                  indent
                />
                <NavItem
                  icon="🔄"
                  label="同步"
                  active={activePlugin === 'sync'}
                  onClick={() => setActivePlugin('sync')}
                  indent
                />
                <NavItem
                  icon="📄"
                  label="文件恢复"
                  active={activePlugin === 'file-recovery'}
                  onClick={() => setActivePlugin('file-recovery')}
                  indent
                />
                <NavItem
                  icon="👁️"
                  label="页面预览"
                  active={activePlugin === 'page-preview'}
                  onClick={() => setActivePlugin('page-preview')}
                  indent
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-semibold">
            {getTabTitle(activeTab, activePlugin)}
          </h1>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl space-y-8">
            {renderContent(activeTab, activePlugin, settings, handleChange)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  indent = false 
}: { 
  icon: string; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors
        ${indent ? 'pl-8' : ''}
        ${active 
          ? 'bg-primary/10 text-primary' 
          : 'text-foreground/80 hover:bg-background hover:text-foreground'
        }
      `}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Get tab title
function getTabTitle(tab: SettingsTab, plugin: CorePluginTab | null): string {
  if (plugin) {
    const pluginTitles: Record<CorePluginTab, string> = {
      'canvas': '白板',
      'backlinks': '反向链接',
      'command-palette': '命令面板',
      'daily-notes': '日记',
      'file-recovery': '文件恢复',
      'graph-view': '关系图谱',
      'note-composer': '笔记重组',
      'outline': '大纲',
      'page-preview': '页面预览',
      'properties': '属性',
      'publish': '发布',
      'random-note': '随机笔记',
      'slash-commands': '斜杠命令',
      'slides': '幻灯片',
      'sync': '同步',
      'tags': '标签',
      'templates': '模板',
      'unique-note-creator': '唯一笔记创建器',
      'word-count': '字数统计',
      'workspaces': '工作区',
    };
    return pluginTitles[plugin];
  }

  const titles: Record<SettingsTab, string> = {
    'about': '关于',
    'editor': '编辑器',
    'files-links': '文件与链接',
    'appearance': '外观',
    'hotkeys': '快捷键',
    'core-plugins': '核心插件',
    'community-plugins': '第三方插件',
  };
  return titles[tab];
}

// Render content based on active tab
function renderContent(
  tab: SettingsTab, 
  plugin: CorePluginTab | null,
  settings: any,
  handleChange: (key: string, value: any) => void
) {
  if (plugin) {
    return renderPluginContent(plugin, settings, handleChange);
  }

  switch (tab) {
    case 'about':
      return <AboutContent />;
    case 'editor':
      return <EditorContent settings={settings} onChange={handleChange} />;
    case 'files-links':
      return <FilesLinksContent settings={settings} onChange={handleChange} />;
    case 'appearance':
      return <AppearanceContent settings={settings} onChange={handleChange} />;
    case 'hotkeys':
      return <HotkeysContent />;
    case 'core-plugins':
      return <CorePluginsContent />;
    case 'community-plugins':
      return <CommunityPluginsContent />;
    default:
      return null;
  }
}

// About Content
function AboutContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">A3Note</h3>
        <p className="text-sm text-foreground/60">版本 1.0.0</p>
      </div>
      <div>
        <p className="text-sm text-foreground/80">
          A3Note 是一个现代化的笔记应用，灵感来自 Obsidian。
        </p>
      </div>
    </div>
  );
}

// Editor Content
function EditorContent({ settings, onChange }: any) {
  return (
    <div className="space-y-8">
      {/* Properties */}
      <Section title="前置属性 (Properties)">
        <SettingItem
          label="在文档中显示属性"
          type="toggle"
          value={settings.showProperties}
          onChange={(v) => onChange('showProperties', v)}
        />
        <SettingItem
          label="默认属性视图模式"
          type="select"
          value={settings.defaultPropertiesView}
          onChange={(v) => onChange('defaultPropertiesView', v)}
          options={[
            { value: 'source', label: '源码' },
            { value: 'table', label: '表格' },
            { value: 'hidden', label: '隐藏' },
          ]}
        />
      </Section>

      {/* Display */}
      <Section title="显示">
        <SettingItem
          label="显示行号"
          type="toggle"
          value={settings.lineNumbers}
          onChange={(v) => onChange('lineNumbers', v)}
        />
        <SettingItem
          label="自动换行"
          type="toggle"
          value={settings.wordWrap}
          onChange={(v) => onChange('wordWrap', v)}
        />
        <SettingItem
          label="显示缩进参考线"
          type="toggle"
          value={settings.showIndentGuides}
          onChange={(v) => onChange('showIndentGuides', v)}
        />
        <SettingItem
          label="显示前置元数据"
          type="toggle"
          value={settings.showFrontmatter}
          onChange={(v) => onChange('showFrontmatter', v)}
        />
      </Section>

      {/* Behavior */}
      <Section title="行为">
        <SettingItem
          label="拼写检查"
          type="toggle"
          value={settings.spellCheck}
          onChange={(v) => onChange('spellCheck', v)}
        />
        <SettingItem
          label="严格换行"
          type="toggle"
          value={settings.strictLineBreaks}
          onChange={(v) => onChange('strictLineBreaks', v)}
        />
        <SettingItem
          label="智能缩进列表"
          type="toggle"
          value={settings.smartIndentLists}
          onChange={(v) => onChange('smartIndentLists', v)}
        />
        <SettingItem
          label="自动配对括号"
          type="toggle"
          value={settings.autoPairBrackets}
          onChange={(v) => onChange('autoPairBrackets', v)}
        />
        <SettingItem
          label="自动配对 Markdown 语法"
          type="toggle"
          value={settings.autoPairMarkdown}
          onChange={(v) => onChange('autoPairMarkdown', v)}
        />
        <SettingItem
          label="Vim 键绑定"
          type="toggle"
          value={settings.vimMode}
          onChange={(v) => onChange('vimMode', v)}
        />
      </Section>

      {/* Advanced */}
      <Section title="高级">
        <SettingItem
          label="默认视图模式"
          type="select"
          value={settings.defaultViewMode}
          onChange={(v) => onChange('defaultViewMode', v)}
          options={[
            { value: 'source', label: '源码模式' },
            { value: 'live-preview', label: '实时预览' },
            { value: 'reading', label: '阅读模式' },
          ]}
        />
        <SettingItem
          label="Tab 大小"
          type="number"
          value={settings.tabSize}
          onChange={(v) => onChange('tabSize', v)}
          min={2}
          max={8}
          step={2}
        />
        <SettingItem
          label="字体大小"
          type="number"
          value={settings.fontSize}
          onChange={(v) => onChange('fontSize', v)}
          min={10}
          max={24}
        />
      </Section>
    </div>
  );
}

// Files & Links Content
function FilesLinksContent({ settings, onChange }: any) {
  return (
    <div className="space-y-8">
      {/* Files */}
      <Section title="文件">
        <SettingItem
          label="确认文件删除"
          type="toggle"
          value={settings.confirmFileDelete}
          onChange={(v) => onChange('confirmFileDelete', v)}
        />
        <SettingItem
          label="删除到系统回收站"
          type="toggle"
          value={settings.deleteToTrash}
          onChange={(v) => onChange('deleteToTrash', v)}
        />
        <SettingItem
          label="新白板文件的默认位置"
          description="新创建的笔记将保存到此位置"
          type="select"
          value={settings.newNoteLocation}
          onChange={(v) => onChange('newNoteLocation', v)}
          options={[
            { value: 'root', label: '仓库的根目录' },
            { value: 'current', label: '当前文件所在文件夹' },
            { value: 'folder', label: '指定文件夹' },
          ]}
        />
        {settings.newNoteLocation === 'folder' && (
          <SettingItem
            label="新笔记文件夹路径"
            type="text"
            value={settings.newNoteFolderPath}
            onChange={(v) => onChange('newNoteFolderPath', v)}
            placeholder="例如: notes/"
          />
        )}
      </Section>

      {/* Attachments */}
      <Section title="附件">
        <SettingItem
          label="附件默认位置"
          type="select"
          value={settings.attachmentLocation}
          onChange={(v) => onChange('attachmentLocation', v)}
          options={[
            { value: 'root', label: '仓库的根目录' },
            { value: 'current', label: '当前文件所在文件夹' },
            { value: 'folder', label: '指定文件夹' },
          ]}
        />
        {settings.attachmentLocation === 'folder' && (
          <SettingItem
            label="附件文件夹路径"
            type="text"
            value={settings.attachmentFolderPath}
            onChange={(v) => onChange('attachmentFolderPath', v)}
            placeholder="例如: attachments/"
          />
        )}
      </Section>

      {/* Links */}
      <Section title="链接">
        <SettingItem
          label="自动更新内部链接"
          description="移动和重命名文件时自动更新内部链接"
          type="toggle"
          value={settings.autoUpdateLinks}
          onChange={(v) => onChange('autoUpdateLinks', v)}
        />
        <SettingItem
          label="使用 [[Wiki 链接]]"
          description="关闭后将使用 Markdown 链接格式"
          type="toggle"
          value={settings.useWikiLinks}
          onChange={(v) => onChange('useWikiLinks', v)}
        />
        <SettingItem
          label="检测所有文件扩展名"
          type="toggle"
          value={settings.detectAllExtensions}
          onChange={(v) => onChange('detectAllExtensions', v)}
        />
      </Section>

      {/* Excluded Files */}
      <Section title="排除的文件">
        <SettingItem
          label="排除的文件模式"
          description="每行一个模式，支持通配符"
          type="textarea"
          value={(settings.excludedFiles || []).join('\n')}
          onChange={(v) => onChange('excludedFiles', v.split('\n').filter(Boolean))}
          placeholder="*.tmp&#10;.DS_Store&#10;node_modules/"
          rows={4}
        />
      </Section>
    </div>
  );
}

// Appearance Content
function AppearanceContent({ settings, onChange }: any) {
  return (
    <div className="space-y-8">
      {/* Base Theme */}
      <Section title="基础主题">
        <SettingItem
          label="主题"
          type="select"
          value={settings.baseTheme}
          onChange={(v) => onChange('baseTheme', v)}
          options={[
            { value: 'dark', label: '深色' },
            { value: 'light', label: '浅色' },
            { value: 'system', label: '跟随系统' },
          ]}
        />
      </Section>

      {/* Font */}
      <Section title="字体">
        <SettingItem
          label="文本字体"
          type="text"
          value={settings.textFont}
          onChange={(v) => onChange('textFont', v)}
          placeholder="Inter, sans-serif"
        />
        <SettingItem
          label="等宽字体"
          type="text"
          value={settings.monospaceFont}
          onChange={(v) => onChange('monospaceFont', v)}
          placeholder="Fira Code, monospace"
        />
        <SettingItem
          label="界面缩放"
          type="range"
          value={settings.interfaceZoom}
          onChange={(v) => onChange('interfaceZoom', v)}
          min={75}
          max={150}
          step={5}
          suffix="%"
        />
        <SettingItem
          label="快速字体大小调整"
          description="使用 Ctrl+滚轮快速调整字体大小"
          type="toggle"
          value={settings.quickFontSizeAdjust}
          onChange={(v) => onChange('quickFontSizeAdjust', v)}
        />
      </Section>

      {/* CSS */}
      <Section title="CSS 代码片段">
        <SettingItem
          label="自定义 CSS"
          description="自定义 CSS 将应用到整个应用"
          type="textarea"
          value={settings.customCSS}
          onChange={(v) => onChange('customCSS', v)}
          placeholder="/* 在此输入自定义 CSS */&#10;.cm-content {&#10;  /* 样式 */&#10;}"
          rows={6}
        />
      </Section>

      {/* Advanced */}
      <Section title="高级">
        <SettingItem
          label="显示内联标题"
          type="toggle"
          value={settings.showInlineTitle}
          onChange={(v) => onChange('showInlineTitle', v)}
        />
        <SettingItem
          label="显示标签页标题栏"
          type="toggle"
          value={settings.showTabTitleBar}
          onChange={(v) => onChange('showTabTitleBar', v)}
        />
        <SettingItem
          label="使用原生菜单"
          type="toggle"
          value={settings.nativeMenus}
          onChange={(v) => onChange('nativeMenus', v)}
        />
        <SettingItem
          label="堆叠标签页"
          type="toggle"
          value={settings.stackTabs}
          onChange={(v) => onChange('stackTabs', v)}
        />
        <SettingItem
          label="窗口透明效果"
          type="toggle"
          value={settings.translucentWindow}
          onChange={(v) => onChange('translucentWindow', v)}
        />
      </Section>
    </div>
  );
}

// Hotkeys Content
function HotkeysContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        快捷键管理功能即将推出...
      </p>
    </div>
  );
}

// Core Plugins Content
function CorePluginsContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        请从左侧选择一个核心插件查看其设置。
      </p>
    </div>
  );
}

// Community Plugins Content
function CommunityPluginsContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        第三方插件功能即将推出...
      </p>
    </div>
  );
}

// Plugin Content Renderer
function renderPluginContent(plugin: CorePluginTab, settings: any, onChange: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        {plugin} 插件设置即将推出...
      </p>
    </div>
  );
}

// Section Component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Setting Item Component
function SettingItem({ 
  label, 
  description,
  type, 
  value, 
  onChange,
  options,
  placeholder,
  min,
  max,
  step,
  rows,
  suffix
}: any) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-foreground/60 mt-1">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">
        {type === 'toggle' && (
          <button
            onClick={() => onChange(!value)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${value ? 'bg-primary' : 'bg-foreground/20'}
            `}
          >
            <div
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${value ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        )}
        {type === 'select' && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded text-sm min-w-[200px]"
          >
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {type === 'text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="px-3 py-1.5 bg-background border border-border rounded text-sm min-w-[200px]"
          />
        )}
        {type === 'number' && (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="px-3 py-1.5 bg-background border border-border rounded text-sm w-20"
          />
        )}
        {type === 'range' && (
          <div className="flex items-center gap-2 min-w-[200px]">
            <input
              type="range"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="flex-1"
            />
            <span className="text-sm text-foreground/60 w-12 text-right">
              {value}{suffix}
            </span>
          </div>
        )}
        {type === 'textarea' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="px-3 py-2 bg-background border border-border rounded text-sm font-mono min-w-[300px] w-full"
          />
        )}
      </div>
    </div>
  );
}
