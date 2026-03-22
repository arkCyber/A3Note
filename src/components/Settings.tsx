import { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useTheme, Theme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
  onClose: () => void;
  onOpenPlugins?: () => void;
}

interface AppSettings {
  fontSize: number;
  autoSave: boolean;
  autoSaveDelay: number;
  spellCheck: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  tabSize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 14,
  autoSave: true,
  autoSaveDelay: 2000,
  spellCheck: true,
  lineNumbers: true,
  wordWrap: true,
  tabSize: 2,
};

export default function Settings({ onClose, onOpenPlugins: _onOpenPlugins }: SettingsProps) {
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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-background rounded transition-colors"
            >
              {t('common:cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
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
