import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../i18n';

describe('i18n Extended Translations', () => {
  beforeEach(() => {
    i18n.changeLanguage('zh-CN');
  });

  describe('Editor Translations', () => {
    it('should have editor translations in Chinese', () => {
      expect(i18n.t('editor:title')).toBe('编辑器');
      expect(i18n.t('editor:extensions.livePreview')).toBe('实时预览');
      expect(i18n.t('editor:extensions.spellCheck')).toBe('拼写检查');
      expect(i18n.t('editor:extensions.vim')).toBe('Vim 模式');
      expect(i18n.t('editor:extensions.math')).toBe('数学公式');
      expect(i18n.t('editor:extensions.mermaid')).toBe('Mermaid 图表');
    });

    it('should have editor translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('editor:title')).toBe('Editor');
      expect(i18n.t('editor:extensions.livePreview')).toBe('Live Preview');
      expect(i18n.t('editor:extensions.spellCheck')).toBe('Spell Check');
      expect(i18n.t('editor:extensions.vim')).toBe('Vim Mode');
      expect(i18n.t('editor:extensions.math')).toBe('Math Formulas');
      expect(i18n.t('editor:extensions.mermaid')).toBe('Mermaid Diagrams');
    });

    it('should have editor actions in Chinese', () => {
      expect(i18n.t('editor:actions.toggleLivePreview')).toBe('切换实时预览');
      expect(i18n.t('editor:actions.insertMath')).toBe('插入数学公式');
      expect(i18n.t('editor:actions.formatTable')).toBe('格式化表格');
    });

    it('should have editor actions in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('editor:actions.toggleLivePreview')).toBe('Toggle Live Preview');
      expect(i18n.t('editor:actions.insertMath')).toBe('Insert Math Formula');
      expect(i18n.t('editor:actions.formatTable')).toBe('Format Table');
    });

    it('should have callout types in Chinese', () => {
      expect(i18n.t('editor:calloutTypes.note')).toBe('笔记');
      expect(i18n.t('editor:calloutTypes.warning')).toBe('警告');
      expect(i18n.t('editor:calloutTypes.tip')).toBe('提示');
    });

    it('should have callout types in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('editor:calloutTypes.note')).toBe('Note');
      expect(i18n.t('editor:calloutTypes.warning')).toBe('Warning');
      expect(i18n.t('editor:calloutTypes.tip')).toBe('Tip');
    });
  });

  describe('Media Translations', () => {
    it('should have media translations in Chinese', () => {
      expect(i18n.t('media:title')).toBe('媒体管理');
      expect(i18n.t('media:upload')).toBe('上传');
      expect(i18n.t('media:delete')).toBe('删除');
      expect(i18n.t('media:preview')).toBe('预览');
    });

    it('should have media translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('media:title')).toBe('Media Manager');
      expect(i18n.t('media:upload')).toBe('Upload');
      expect(i18n.t('media:delete')).toBe('Delete');
      expect(i18n.t('media:preview')).toBe('Preview');
    });

    it('should have media filters in Chinese', () => {
      expect(i18n.t('media:filter.all')).toBe('全部');
      expect(i18n.t('media:filter.images')).toBe('图片');
      expect(i18n.t('media:filter.videos')).toBe('视频');
    });

    it('should have media filters in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('media:filter.all')).toBe('All');
      expect(i18n.t('media:filter.images')).toBe('Images');
      expect(i18n.t('media:filter.videos')).toBe('Videos');
    });
  });

  describe('Graph Translations', () => {
    it('should have graph translations in Chinese', () => {
      expect(i18n.t('graph:title')).toBe('关系图');
      expect(i18n.t('graph:localGraph')).toBe('局部图');
      expect(i18n.t('graph:globalGraph')).toBe('全局图');
    });

    it('should have graph translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('graph:title')).toBe('Graph View');
      expect(i18n.t('graph:localGraph')).toBe('Local Graph');
      expect(i18n.t('graph:globalGraph')).toBe('Global Graph');
    });

    it('should have graph filters in Chinese', () => {
      expect(i18n.t('graph:filters.title')).toBe('过滤器');
      expect(i18n.t('graph:filters.tags')).toBe('标签');
      expect(i18n.t('graph:filters.folders')).toBe('文件夹');
    });

    it('should have graph filters in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('graph:filters.title')).toBe('Filters');
      expect(i18n.t('graph:filters.tags')).toBe('Tags');
      expect(i18n.t('graph:filters.folders')).toBe('Folders');
    });
  });

  describe('Tags Translations', () => {
    it('should have tags translations in Chinese', () => {
      expect(i18n.t('tags:title')).toBe('标签');
      expect(i18n.t('tags:noTags')).toBe('暂无标签');
      expect(i18n.t('tags:search')).toBe('搜索标签');
    });

    it('should have tags translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('tags:title')).toBe('Tags');
      expect(i18n.t('tags:noTags')).toBe('No tags');
      expect(i18n.t('tags:search')).toBe('Search tags');
    });

    it('should have tags actions in Chinese', () => {
      expect(i18n.t('tags:actions.rename')).toBe('重命名标签');
      expect(i18n.t('tags:actions.delete')).toBe('删除标签');
      expect(i18n.t('tags:actions.merge')).toBe('合并标签');
    });

    it('should have tags actions in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('tags:actions.rename')).toBe('Rename Tag');
      expect(i18n.t('tags:actions.delete')).toBe('Delete Tag');
      expect(i18n.t('tags:actions.merge')).toBe('Merge Tags');
    });
  });

  describe('Ribbon Translations', () => {
    it('should have ribbon translations in Chinese', () => {
      expect(i18n.t('ribbon:search')).toBe('搜索');
      expect(i18n.t('ribbon:settings')).toBe('设置');
      expect(i18n.t('ribbon:help')).toBe('帮助');
    });

    it('should have ribbon translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('ribbon:search')).toBe('Search');
      expect(i18n.t('ribbon:settings')).toBe('Settings');
      expect(i18n.t('ribbon:help')).toBe('Help');
    });
  });

  describe('Spell Check Translations', () => {
    it('should have spell check translations in Chinese', () => {
      expect(i18n.t('spellCheck:enabled')).toBe('拼写检查已启用');
      expect(i18n.t('spellCheck:disabled')).toBe('拼写检查已禁用');
    });

    it('should have spell check translations in English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('spellCheck:enabled')).toBe('Spell check enabled');
      expect(i18n.t('spellCheck:disabled')).toBe('Spell check disabled');
    });
  });

  describe('Translation Completeness', () => {
    it('should have all namespaces loaded for Chinese', () => {
      const namespaces = [
        'common',
        'toolbar',
        'sidebar',
        'settings',
        'commandPalette',
        'statusBar',
        'welcome',
        'messages',
        'ribbon',
        'spellCheck',
        'editor',
        'media',
        'graph',
        'tags',
      ];

      namespaces.forEach((ns) => {
        expect(i18n.hasResourceBundle('zh-CN', ns)).toBe(true);
      });
    });

    it('should have all namespaces loaded for English', () => {
      const namespaces = [
        'common',
        'toolbar',
        'sidebar',
        'settings',
        'commandPalette',
        'statusBar',
        'welcome',
        'messages',
        'ribbon',
        'spellCheck',
        'editor',
        'media',
        'graph',
        'tags',
      ];

      namespaces.forEach((ns) => {
        expect(i18n.hasResourceBundle('en-US', ns)).toBe(true);
      });
    });
  });

  describe('Interpolation', () => {
    it('should support interpolation in tags count', () => {
      const result = i18n.t('tags:count', { count: 5 });
      expect(result).toContain('5');
    });

    it('should support interpolation in English', async () => {
      await i18n.changeLanguage('en-US');
      const result = i18n.t('tags:count', { count: 10 });
      expect(result).toContain('10');
    });
  });
});
