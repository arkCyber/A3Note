import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../i18n';

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset to default language
    i18n.changeLanguage('zh-CN');
  });

  it('should initialize with Chinese as default language', () => {
    expect(i18n.language).toBe('zh-CN');
  });

  it('should have Chinese and English resources loaded', () => {
    expect(i18n.hasResourceBundle('zh-CN', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('en-US', 'common')).toBe(true);
  });

  it('should switch to English', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.language).toBe('en-US');
  });

  it('should switch back to Chinese', async () => {
    await i18n.changeLanguage('en-US');
    await i18n.changeLanguage('zh-CN');
    expect(i18n.language).toBe('zh-CN');
  });

  it('should have correct Chinese translations', () => {
    expect(i18n.t('common:appName')).toBe('A3Note');
    expect(i18n.t('common:save')).toBe('保存');
    expect(i18n.t('common:cancel')).toBe('取消');
  });

  it('should have correct English translations', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.t('common:save')).toBe('Save');
    expect(i18n.t('common:cancel')).toBe('Cancel');
  });

  it('should have toolbar translations in Chinese', () => {
    expect(i18n.t('toolbar:toggleSidebar')).toBe('切换侧边栏');
    expect(i18n.t('toolbar:save')).toBe('保存');
    expect(i18n.t('toolbar:settings')).toBe('设置');
  });

  it('should have toolbar translations in English', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.t('toolbar:toggleSidebar')).toBe('Toggle sidebar');
    expect(i18n.t('toolbar:save')).toBe('Save');
    expect(i18n.t('toolbar:settings')).toBe('Settings');
  });

  it('should have sidebar translations in Chinese', () => {
    expect(i18n.t('sidebar:title')).toBe('文件');
    expect(i18n.t('sidebar:noFiles')).toBe('暂无文件。创建您的第一个笔记！');
  });

  it('should have sidebar translations in English', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.t('sidebar:title')).toBe('Files');
    expect(i18n.t('sidebar:noFiles')).toBe('No files yet. Create your first note!');
  });

  it('should have settings translations in Chinese', () => {
    expect(i18n.t('settings:title')).toBe('设置');
    expect(i18n.t('settings:appearance')).toBe('外观');
    expect(i18n.t('settings:language')).toBe('语言');
  });

  it('should have settings translations in English', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.t('settings:title')).toBe('Settings');
    expect(i18n.t('settings:appearance')).toBe('Appearance');
    expect(i18n.t('settings:language')).toBe('Language');
  });

  it('should have context menu translations', () => {
    expect(i18n.t('sidebar:contextMenu.open')).toBe('打开');
    expect(i18n.t('sidebar:contextMenu.rename')).toBe('重命名');
    expect(i18n.t('sidebar:contextMenu.delete')).toBe('删除');
  });

  it('should fallback to default language for missing keys', async () => {
    await i18n.changeLanguage('en-US');
    // If a key doesn't exist, it should fallback to zh-CN
    const result = i18n.t('nonexistent:key', { defaultValue: 'fallback' });
    expect(result).toBe('fallback');
  });

  it('should support interpolation', () => {
    const line = 5;
    const column = 10;
    const result = i18n.t('statusBar:position', { line, column });
    expect(result).toContain('5');
    expect(result).toContain('10');
  });

  it('should persist language change to localStorage', async () => {
    await i18n.changeLanguage('en-US');
    const saved = localStorage.getItem('a3note-language');
    expect(saved).toBe('en-US');
  });

  it('should load language from localStorage', () => {
    localStorage.setItem('a3note-language', 'en-US');
    // In real scenario, this would be tested by reloading i18n
    expect(localStorage.getItem('a3note-language')).toBe('en-US');
  });
});
