// Template Selector Component - Aerospace Grade
// UI for selecting and applying templates

import { useState } from 'react';
import { FileText, X, Search, Sparkles } from 'lucide-react';
import { templateService, type Template } from '../services/templates';

interface TemplateSelectorProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const templates = templateService.getAllTemplates();
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    
    // Initialize variables
    const vars: Record<string, string> = {};
    template.variables?.forEach(varName => {
      if (!['date', 'time', 'datetime'].includes(varName)) {
        vars[varName] = '';
      }
    });
    setVariables(vars);
  };

  const handleApply = () => {
    if (!selectedTemplate) return;

    const content = templateService.applyTemplate(selectedTemplate.id, variables);
    onSelect(content);
    onClose();
  };

  const handleQuickApply = (template: Template) => {
    const content = templateService.applyTemplate(template.id);
    onSelect(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Select Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 border-r border-border flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 space-y-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category!)}
                    className={`px-3 py-1 text-xs rounded transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  onDoubleClick={() => handleQuickApply(template)}
                  className={`w-full text-left p-3 rounded mb-2 transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-primary/20 border border-primary'
                      : 'hover:bg-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{template.name}</div>
                      {template.description && (
                        <div className="text-xs text-foreground/60 mt-1">
                          {template.description}
                        </div>
                      )}
                      {template.category && (
                        <div className="text-xs text-primary mt-1 capitalize">
                          {template.category}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-foreground/40">
                  <p>No templates found</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview and Variables */}
          <div className="w-1/2 flex flex-col">
            {selectedTemplate ? (
              <>
                {/* Variables Input */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div className="p-4 border-b border-border bg-secondary/30">
                    <h3 className="text-sm font-semibold mb-3">Template Variables</h3>
                    <div className="space-y-2">
                      {selectedTemplate.variables
                        .filter(v => !['date', 'time', 'datetime'].includes(v))
                        .map(varName => (
                          <div key={varName}>
                            <label className="block text-xs text-foreground/70 mb-1 capitalize">
                              {varName.replace(/_/g, ' ')}
                            </label>
                            <input
                              type="text"
                              value={variables[varName] || ''}
                              onChange={(e) => setVariables({ ...variables, [varName]: e.target.value })}
                              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-sm font-semibold mb-2">Preview</h3>
                  <pre className="text-xs font-mono bg-secondary/30 p-4 rounded border border-border whitespace-pre-wrap">
                    {templateService.applyTemplate(selectedTemplate.id, variables)}
                  </pre>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border bg-secondary/30 flex gap-2 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                  >
                    Apply Template
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-foreground/40">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a template to preview</p>
                  <p className="text-xs mt-1">Double-click to apply quickly</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
