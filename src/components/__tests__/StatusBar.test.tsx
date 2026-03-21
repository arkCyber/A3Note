import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from '../StatusBar';

describe('StatusBar', () => {
  it('should render without file', () => {
    render(<StatusBar currentFile={null} content="" />);
    
    expect(screen.getByText('Words:')).toBeInTheDocument();
    expect(screen.getByText(/Words:/).parentElement).toHaveTextContent('0');
  });

  it('should display file name when file is selected', () => {
    const file = {
      path: '/test/note.md',
      name: 'note.md',
      isDirectory: false,
    };

    render(<StatusBar currentFile={file} content="Test content" />);
    
    expect(screen.getByText('note.md')).toBeInTheDocument();
  });

  it('should calculate word count correctly', () => {
    render(<StatusBar currentFile={null} content="Hello world test content" />);
    
    expect(screen.getByText(/Words:/).parentElement).toHaveTextContent('4');
  });

  it('should calculate line count correctly', () => {
    const content = "Line 1\nLine 2\nLine 3";
    render(<StatusBar currentFile={null} content={content} />);
    
    expect(screen.getByText(/Lines:/).parentElement).toHaveTextContent('3');
  });

  it('should calculate character count correctly', () => {
    render(<StatusBar currentFile={null} content="Hello" />);
    
    expect(screen.getByText(/Characters:/).parentElement).toHaveTextContent('5');
  });

  it('should display cursor position when provided', () => {
    render(
      <StatusBar
        currentFile={null}
        content="Test"
        cursorPosition={{ line: 5, column: 10 }}
      />
    );
    
    expect(screen.getByText(/Ln 5, Col 10/)).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    render(<StatusBar currentFile={null} content="" />);
    
    expect(screen.getByText('Words:')).toBeInTheDocument();
    expect(screen.getByText(/Words:/).parentElement).toHaveTextContent('0');
  });

  it('should display Markdown language indicator', () => {
    render(<StatusBar currentFile={null} content="Test" />);
    
    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });
});
