import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Cloud } from 'lucide-react';
import { useTheme, Theme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
  onClose: () => void;
  onOpenPlugins?: () => void;
  onOpenSync?: () => void;
}

interface AppSettings {
  // 基础编辑器
  fontSize: number;
  autoSave: boolean;
  autoSaveDelay: number;
  spellCheck: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  tabSize: number;
  
  // 高级编辑器
  vimMode: boolean;
  defaultViewMode: 'source' | 'live-preview' | 'reading';
  showFrontmatter: boolean;
  showIndentGuides: boolean;
  strictLineBreaks: boolean;
  smartIndentLists: boolean;
  foldHeading: boolean;
  foldIndent: boolean;
  autoPairBrackets: boolean;
  autoPairMarkdown: boolean;
  
  // 文件与链接
  confirmFileDelete: boolean;
  deleteToTrash: boolean;
  newNoteLocation: 'root' | 'current' | 'folder';
  newNoteFolderPath: string;
  attachmentLocation: 'root' | 'current' | 'folder';
  attachmentFolderPath: string;
  autoUpdateLinks: boolean;
  useWikiLinks: boolean;
  
  // 外观高级
  baseTheme: 'dark' | 'light' | 'system';
  showInlineTitle: boolean;
  showTabTitleBar: boolean;
  nativeMenus: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  // 基础编辑器
  fontSize: 14,
  autoSave: true,
  autoSaveDelay: 2000,
  spellCheck: true,
  lineNumbers: true,
  wordWrap: true,
  tabSize: 2,
  
  // 高级编辑器
  vimMode: false,
  defaultViewMode: 'live-preview',
  showFrontmatter: true,
  showIndentGuides: false,
  strictLineBreaks: false,
  smartIndentLists: true,
  foldHeading: true,
  foldIndent: true,
  autoPairBrackets: true,
  autoPairMarkdown: true,
  
  // 文件与链接
  confirmFileDelete: true,
  deleteToTrash: true,
  newNoteLocation: 'root',
  newNoteFolderPath: '',
  attachmentLocation: 'folder',
  attachmentFolderPath: 'attachments',
  autoUpdateLinks: true,
  useWikiLinks: true,
  
  // 外观高级
  baseTheme: 'dark',
  showInlineTitle: true,
  showTabTitleBar: true,
  nativeMenus: false,
};

export default function Settings({ onClose, onOpenPlugins: _onOpenPlugins, onOpenSync }: SettingsProps) {
  const { t, i18n } = useTranslation('settings');
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setHasChanges(false);
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded transition-colors"
            title={t('close')}
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Appearance */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">{t('appearance')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">{t('theme')}</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="dark">{t('themes.darkWarm')}</option>
                  <option value="light">{t('themes.light')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">{t('language')}</label>
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="zh-CN">{t('languages.zh-CN')}</option>
                  <option value="en-US">{t('languages.en-US')}</option>
                  <option value="ja-JP">{t('languages.ja-JP')}</option>
                  <option value="ko-KR">{t('languages.ko-KR')}</option>
                  <option value="zh-TW">{t('languages.zh-TW')}</option>
                  <option value="th-TH">{t('languages.th-TH')}</option>
                  <option value="vi-VN">{t('languages.vi-VN')}</option>
                  <option value="id-ID">{t('languages.id-ID')}</option>
                  <option value="ms-MY">{t('languages.ms-MY')}</option>
                  <option value="hi-IN">{t('languages.hi-IN')}</option>
                  <option value="fr-FR">{t('languages.fr-FR')}</option>
                  <option value="de-DE">{t('languages.de-DE')}</option>
                  <option value="es-ES">{t('languages.es-ES')}</option>
                  <option value="it-IT">{t('languages.it-IT')}</option>
                  <option value="pt-BR">{t('languages.pt-BR')}</option>
                  <option value="ru-RU">{t('languages.ru-RU')}</option>
                  <option value="pl-PL">{t('languages.pl-PL')}</option>
                  <option value="nl-NL">{t('languages.nl-NL')}</option>
                  <option value="sv-SE">{t('languages.sv-SE')}</option>
                  <option value="tr-TR">{t('languages.tr-TR')}</option>
                  <option value="ar-SA">{t('languages.ar-SA')}</option>
                  <option value="he-IL">{t('languages.he-IL')}</option>
                  <option value="fa-IR">{t('languages.fa-IR')}</option>
                  <option value="uk-UA">{t('languages.uk-UA')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">
                  {t('fontSize')}: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Editor */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">{t('editor')}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">{t('autoSave')}</label>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              {settings.autoSave && (
                <div>
                  <label className="block text-sm mb-2">
                    {t('autoSaveDelay')}: {settings.autoSaveDelay / 1000}s
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={settings.autoSaveDelay}
                    onChange={(e) => handleChange('autoSaveDelay', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm">{t('spellCheck', { defaultValue: 'Spell Check' })}</label>
                <input
                  type="checkbox"
                  checked={settings.spellCheck}
                  onChange={(e) => handleChange('spellCheck', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">{t('showLineNumbers')}</label>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => handleChange('lineNumbers', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">{t('wordWrap')}</label>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => handleChange('wordWrap', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  {t('tabSize')}: {settings.tabSize} spaces
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="2"
                  value={settings.tabSize}
                  onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Properties */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">前置属性 (Properties)</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">在文档中显示属性</label>
                <input
                  type="checkbox"
                  checked={settings.showProperties}
                  onChange={(e) => handleChange('showProperties', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">默认属性视图模式</label>
                <select
                  value={settings.defaultPropertiesView}
                  onChange={(e) => handleChange('defaultPropertiesView', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="source">源码</option>
                  <option value="table">表格</option>
                  <option value="hidden">隐藏</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">属性位置</label>
                <select
                  value={settings.propertiesPosition}
                  onChange={(e) => handleChange('propertiesPosition', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="top">顶部</option>
                  <option value="bottom">底部</option>
                </select>
              </div>
            </div>
          </section>

          {/* Advanced Editor */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">高级编辑器</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Vim 键绑定</label>
                <input
                  type="checkbox"
                  checked={settings.vimMode}
                  onChange={(e) => handleChange('vimMode', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">默认视图模式</label>
                <select
                  value={settings.defaultViewMode}
                  onChange={(e) => handleChange('defaultViewMode', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="source">源码模式</option>
                  <option value="live-preview">实时预览</option>
                  <option value="reading">阅读模式</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">显示前置元数据</label>
                <input
                  type="checkbox"
                  checked={settings.showFrontmatter}
                  onChange={(e) => handleChange('showFrontmatter', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">显示缩进参考线</label>
                <input
                  type="checkbox"
                  checked={settings.showIndentGuides}
                  onChange={(e) => handleChange('showIndentGuides', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">智能缩进列表</label>
                <input
                  type="checkbox"
                  checked={settings.smartIndentLists}
                  onChange={(e) => handleChange('smartIndentLists', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">折叠标题</label>
                <input
                  type="checkbox"
                  checked={settings.foldHeading}
                  onChange={(e) => handleChange('foldHeading', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">自动配对括号</label>
                <input
                  type="checkbox"
                  checked={settings.autoPairBrackets}
                  onChange={(e) => handleChange('autoPairBrackets', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">自动配对 Markdown 语法</label>
                <input
                  type="checkbox"
                  checked={settings.autoPairMarkdown}
                  onChange={(e) => handleChange('autoPairMarkdown', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </section>

          {/* Files & Links */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">文件与链接</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">确认删除文件</label>
                <input
                  type="checkbox"
                  checked={settings.confirmFileDelete}
                  onChange={(e) => handleChange('confirmFileDelete', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">删除到系统回收站</label>
                <input
                  type="checkbox"
                  checked={settings.deleteToTrash}
                  onChange={(e) => handleChange('deleteToTrash', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">新建笔记位置</label>
                <select
                  value={settings.newNoteLocation}
                  onChange={(e) => handleChange('newNoteLocation', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="root">仓库根目录</option>
                  <option value="current">当前文件夹</option>
                  <option value="folder">指定文件夹</option>
                </select>
              </div>

              {settings.newNoteLocation === 'folder' && (
                <div>
                  <label className="block text-sm mb-2">新建笔记文件夹路径</label>
                  <input
                    type="text"
                    value={settings.newNoteFolderPath}
                    onChange={(e) => handleChange('newNoteFolderPath', e.target.value)}
                    placeholder="notes"
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2">附件存储位置</label>
                <select
                  value={settings.attachmentLocation}
                  onChange={(e) => handleChange('attachmentLocation', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="root">仓库根目录</option>
                  <option value="current">当前文件夹</option>
                  <option value="folder">指定文件夹</option>
                </select>
              </div>

              {settings.attachmentLocation === 'folder' && (
                <div>
                  <label className="block text-sm mb-2">附件文件夹路径</label>
                  <input
                    type="text"
                    value={settings.attachmentFolderPath}
                    onChange={(e) => handleChange('attachmentFolderPath', e.target.value)}
                    placeholder="attachments"
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm">自动更新内部链接</label>
                <input
                  type="checkbox"
                  checked={settings.autoUpdateLinks}
                  onChange={(e) => handleChange('autoUpdateLinks', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">使用 [[Wiki 链接]]</label>
                <input
                  type="checkbox"
                  checked={settings.useWikiLinks}
                  onChange={(e) => handleChange('useWikiLinks', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">检测所有文件扩展名</label>
                <input
                  type="checkbox"
                  checked={settings.detectAllExtensions}
                  onChange={(e) => handleChange('detectAllExtensions', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">排除的文件 (每行一个模式)</label>
                <textarea
                  value={(settings.excludedFiles || []).join('\n')}
                  onChange={(e) => handleChange('excludedFiles', e.target.value.split('\n').filter(Boolean))}
                  placeholder="*.tmp&#10;.DS_Store&#10;node_modules/"
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary font-mono text-sm"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  支持通配符，如 *.tmp 或 .git/
                </p>
              </div>
            </div>
          </section>

          {/* Font Settings */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">字体</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">文本字体</label>
                <input
                  type="text"
                  value={settings.textFont}
                  onChange={(e) => handleChange('textFont', e.target.value)}
                  placeholder="Inter, sans-serif"
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">等宽字体</label>
                <input
                  type="text"
                  value={settings.monospaceFont}
                  onChange={(e) => handleChange('monospaceFont', e.target.value)}
                  placeholder="Fira Code, monospace"
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  界面缩放: {settings.interfaceZoom}%
                </label>
                <input
                  type="range"
                  min="75"
                  max="150"
                  step="5"
                  value={settings.interfaceZoom}
                  onChange={(e) => handleChange('interfaceZoom', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">快速字体大小调整 (Ctrl+滚轮)</label>
                <input
                  type="checkbox"
                  checked={settings.quickFontSizeAdjust}
                  onChange={(e) => handleChange('quickFontSizeAdjust', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </section>

          {/* CSS Snippets */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">CSS 代码片段</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">自定义 CSS</label>
                <textarea
                  value={settings.customCSS}
                  onChange={(e) => handleChange('customCSS', e.target.value)}
                  placeholder="/* 在此输入自定义 CSS */&#10;.cm-content {&#10;  /* 样式 */&#10;}"
                  rows={6}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary font-mono text-sm"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  自定义 CSS 将应用到整个应用
                </p>
              </div>
            </div>
          </section>

          {/* Appearance Advanced */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-accent">外观高级</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">基础主题</label>
                <select
                  value={settings.baseTheme}
                  onChange={(e) => handleChange('baseTheme', e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
                >
                  <option value="dark">深色</option>
                  <option value="light">浅色</option>
                  <option value="system">跟随系统</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">显示内联标题</label>
                <input
                  type="checkbox"
                  checked={settings.showInlineTitle}
                  onChange={(e) => handleChange('showInlineTitle', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">显示标签页标题栏</label>
                <input
                  type="checkbox"
                  checked={settings.showTabTitleBar}
                  onChange={(e) => handleChange('showTabTitleBar', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">使用原生菜单</label>
                <input
                  type="checkbox"
                  checked={settings.nativeMenus}
                  onChange={(e) => handleChange('nativeMenus', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">堆叠标签页</label>
                <input
                  type="checkbox"
                  checked={settings.stackTabs}
                  onChange={(e) => handleChange('stackTabs', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">窗口透明效果</label>
                <input
                  type="checkbox"
                  checked={settings.translucentWindow}
                  onChange={(e) => handleChange('translucentWindow', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background rounded transition-colors"
          >
            <RotateCcw size={16} />
            {t('reset')}
          </button>

          <div className="flex gap-2">
            {onOpenSync && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSync();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background rounded transition-colors"
              >
                <Cloud size={16} />
                {t('sync', { defaultValue: 'Sync' })}
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
