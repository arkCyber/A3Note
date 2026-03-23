// Template Service - Aerospace Grade
// Manages note templates with variable substitution

import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../utils/logger';

export interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  category?: string;
  variables?: string[];
}

export interface TemplateVariable {
  name: string;
  value: string;
  type: 'text' | 'date' | 'time' | 'datetime' | 'number';
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'daily-note',
    name: 'Daily Note',
    description: 'Template for daily notes',
    category: 'productivity',
    content: `# {{date:YYYY-MM-DD}} Daily Note

## 📋 Today's Tasks
- [ ] 

## 📝 Notes


## 💡 Ideas


## 🎯 Goals
- 

## 📊 Summary
`,
    variables: ['date'],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for meeting notes',
    category: 'work',
    content: `# Meeting: {{title}}

**Date**: {{date:YYYY-MM-DD}}  
**Time**: {{time:HH:mm}}  
**Attendees**: 

## Agenda
1. 

## Discussion


## Action Items
- [ ] 

## Next Steps
`,
    variables: ['title', 'date', 'time'],
  },
  {
    id: 'project',
    name: 'Project',
    description: 'Template for project planning',
    category: 'work',
    content: `# Project: {{project_name}}

## Overview
**Status**: 🟡 In Progress  
**Start Date**: {{date:YYYY-MM-DD}}  
**Due Date**:   
**Owner**: 

## Objectives


## Milestones
- [ ] 

## Resources


## Notes
`,
    variables: ['project_name', 'date'],
  },
  {
    id: 'book-notes',
    name: 'Book Notes',
    description: 'Template for book reading notes',
    category: 'learning',
    content: `# 📚 {{book_title}}

**Author**: {{author}}  
**Started**: {{date:YYYY-MM-DD}}  
**Status**: Reading

## Summary


## Key Takeaways
- 

## Quotes
> 

## My Thoughts


## Rating
⭐⭐⭐⭐⭐
`,
    variables: ['book_title', 'author', 'date'],
  },
  {
    id: 'blank',
    name: 'Blank Note',
    description: 'Empty note with title',
    category: 'basic',
    content: `# {{title}}

`,
    variables: ['title'],
  },
];

/**
 * Template Service
 * Manages note templates with variable substitution
 */
export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, Template> = new Map();

  private constructor() {
    // Load default templates
    DEFAULT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    );
  }

  /**
   * Apply template with variable substitution
   */
  applyTemplate(templateId: string, variables?: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      log.error('[TemplateService] Template not found:', templateId);
      return '';
    }

    let content = template.content;

    // Substitute variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      });
    }

    // Substitute date/time variables
    content = this.substituteDateTimeVariables(content);

    // Clean up any remaining variables
    content = content.replace(/{{[^}]+}}/g, '');

    log.info('[TemplateService] Applied template:', templateId);
    return content;
  }

  /**
   * Substitute date and time variables
   */
  private substituteDateTimeVariables(content: string): string {
    const now = new Date();

    // Date formats
    const dateFormats: Record<string, string> = {
      'YYYY-MM-DD': this.formatDate(now, 'YYYY-MM-DD'),
      'YYYY/MM/DD': this.formatDate(now, 'YYYY/MM/DD'),
      'DD-MM-YYYY': this.formatDate(now, 'DD-MM-YYYY'),
      'MM-DD-YYYY': this.formatDate(now, 'MM-DD-YYYY'),
      'MMMM DD, YYYY': this.formatDate(now, 'MMMM DD, YYYY'),
    };

    // Time formats
    const timeFormats: Record<string, string> = {
      'HH:mm': this.formatTime(now, 'HH:mm'),
      'HH:mm:ss': this.formatTime(now, 'HH:mm:ss'),
      'hh:mm A': this.formatTime(now, 'hh:mm A'),
    };

    // Replace date variables
    Object.entries(dateFormats).forEach(([format, value]) => {
      const regex = new RegExp(`{{date:${format}}}`, 'g');
      content = content.replace(regex, value);
    });

    // Replace time variables
    Object.entries(timeFormats).forEach(([format, value]) => {
      const regex = new RegExp(`{{time:${format}}}`, 'g');
      content = content.replace(regex, value);
    });

    // Replace datetime variables
    content = content.replace(/{{datetime}}/g, `${dateFormats['YYYY-MM-DD']} ${timeFormats['HH:mm']}`);
    content = content.replace(/{{date}}/g, dateFormats['YYYY-MM-DD']);
    content = content.replace(/{{time}}/g, timeFormats['HH:mm']);

    return content;
  }

  /**
   * Format date
   */
  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'MMMM DD, YYYY':
        return `${monthNames[date.getMonth()]} ${day}, ${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Format time
   */
  private formatTime(date: Date, format: string): string {
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    switch (format) {
      case 'HH:mm':
        return `${String(hours24).padStart(2, '0')}:${minutes}`;
      case 'HH:mm:ss':
        return `${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`;
      case 'hh:mm A':
        return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
      default:
        return `${String(hours24).padStart(2, '0')}:${minutes}`;
    }
  }

  /**
   * Create custom template
   */
  createTemplate(template: Omit<Template, 'id'>): Template {
    const id = `custom-${Date.now()}`;
    const newTemplate: Template = {
      id,
      ...template,
    };
    this.templates.set(id, newTemplate);
    log.info('[TemplateService] Created template:', id);
    return newTemplate;
  }

  /**
   * Update template
   */
  updateTemplate(id: string, updates: Partial<Template>): boolean {
    const template = this.templates.get(id);
    if (!template) {
      log.error('[TemplateService] Template not found:', id);
      return false;
    }

    this.templates.set(id, { ...template, ...updates });
    log.info('[TemplateService] Updated template:', id);
    return true;
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      log.info('[TemplateService] Deleted template:', id);
    }
    return deleted;
  }

  /**
   * Extract variables from template content
   */
  extractVariables(content: string): string[] {
    const matches = content.matchAll(/{{([^:}]+)(?::[^}]+)?}}/g);
    const variables = new Set<string>();
    
    for (const match of matches) {
      const varName = match[1];
      if (!['date', 'time', 'datetime'].includes(varName)) {
        variables.add(varName);
      }
    }

    return Array.from(variables);
  }

  /**
   * Create daily note
   */
  createDailyNote(date?: Date): string {
    const targetDate = date || new Date();
    const dateStr = this.formatDate(targetDate, 'YYYY-MM-DD');
    
    return this.applyTemplate('daily-note', {
      date: dateStr,
    });
  }
}

// Export singleton instance
export const templateService = TemplateService.getInstance();
