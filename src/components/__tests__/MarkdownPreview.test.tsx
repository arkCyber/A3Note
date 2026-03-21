import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownPreview from '../MarkdownPreview';

describe('MarkdownPreview', () => {
  it('should render markdown content as HTML', () => {
    const markdown = '# Hello World\n\nThis is a test.';
    render(<MarkdownPreview content={markdown} />);
    
    const heading = screen.getByText('Hello World');
    expect(heading).toBeInTheDocument();
  });

  it('should render bold text', () => {
    const markdown = 'This is **bold** text.';
    const { container } = render(<MarkdownPreview content={markdown} />);
    
    const strong = container.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('bold');
  });

  it('should render italic text', () => {
    const markdown = 'This is *italic* text.';
    const { container } = render(<MarkdownPreview content={markdown} />);
    
    const em = container.querySelector('em');
    expect(em).toBeInTheDocument();
    expect(em?.textContent).toBe('italic');
  });

  it('should render code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    const { container } = render(<MarkdownPreview content={markdown} />);
    
    const pre = container.querySelector('pre');
    const code = container.querySelector('code');
    expect(pre).toBeInTheDocument();
    expect(code).toBeInTheDocument();
  });

  it('should render tables', () => {
    const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    
    const { container } = render(<MarkdownPreview content={markdown} />);
    
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('should sanitize dangerous HTML', () => {
    const markdown = '<script>alert("XSS")</script>';
    const { container } = render(<MarkdownPreview content={markdown} />);
    
    const script = container.querySelector('script');
    expect(script).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MarkdownPreview content="# Test" className="custom-class" />
    );
    
    const preview = container.querySelector('.custom-class');
    expect(preview).toBeInTheDocument();
  });

  it('should update when markdown changes', () => {
    const { rerender } = render(
      <MarkdownPreview markdown="# Initial" />
    );
    
    expect(screen.getByText('Initial')).toBeInTheDocument();
    
    rerender(<MarkdownPreview content="# Second" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
