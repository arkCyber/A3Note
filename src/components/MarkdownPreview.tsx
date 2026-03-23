import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    // Configure marked options for GitHub Flavored Markdown
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });

    // Convert markdown to HTML
    let processedContent = content;
    
    // Process task lists (GitHub style)
    processedContent = processedContent.replace(
      /^(\s*)- \[([ xX])\] (.+)$/gm,
      (match, indent, checked, text) => {
        const isChecked = checked.toLowerCase() === 'x';
        return `${indent}- <input type="checkbox" ${isChecked ? 'checked' : ''} disabled> ${text}`;
      }
    );

    const rawHtml = marked(processedContent);
    
    // Sanitize HTML to prevent XSS attacks
    const cleanHtml = DOMPurify.sanitize(rawHtml as string, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'strong', 'em', 'del', 'ins',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'input',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title',
        'class', 'id',
        'target', 'rel',
        'type', 'checked', 'disabled',
      ],
    });

    setHtml(cleanHtml);
  }, [content]);

  return (
    <div
      className={`markdown-preview prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#d4d4d4',
      }}
    />
  );
}
