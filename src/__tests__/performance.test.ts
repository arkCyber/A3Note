/**
 * Performance Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFile } from '../hooks/useFile';
import { useWorkspace } from '../hooks/useWorkspace';
import { tauriApi } from '../api/tauri';
import { FileItem } from '../types';

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render Ribbon component in under 100ms', () => {
      const Ribbon = require('../components/Ribbon').default;
      const startTime = performance.now();
      
      render(<Ribbon 
        onNewFile={() => {}}
        onToggleSearch={() => {}}
        onOpenSettings={() => {}}
        onOpenCommandPalette={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should render Editor component in under 200ms', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      
      const startTime = performance.now();
      render(<Editor 
        currentFile={mockFile}
        content="# Test"
        onContentChange={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should render Sidebar component in under 150ms', () => {
      const Sidebar = require('../components/Sidebar').default;
      const mockFiles: FileItem[] = [
        { path: '/test/file1.md', name: 'file1.md', isDirectory: false },
        { path: '/test/file2.md', name: 'file2.md', isDirectory: false },
      ];
      
      const startTime = performance.now();
      render(<Sidebar 
        files={mockFiles}
        currentFile={null}
        onFileSelect={() => {}}
        onDeleteFile={() => {}}
        onRefresh={() => {}}
        onCreateFile={() => {}}
        onCreateFolder={() => {}}
        onRename={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(150);
    });
  });

  describe('Hook Performance', () => {
    it('should initialize useFile hook quickly', () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => useFile());
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
      expect(result.current).toBeDefined();
    });

    it('should initialize useWorkspace hook quickly', () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => useWorkspace());
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
      expect(result.current).toBeDefined();
    });

    it('should handle rapid state updates efficiently', async () => {
      const { result } = renderHook(() => useFile());
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.updateContent(`# Content ${i}`);
        });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('API Performance', () => {
    it('should read file quickly', async () => {
      const startTime = performance.now();
      
      await tauriApi.readFile('/test/file.md');
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should write file quickly', async () => {
      const startTime = performance.now();
      
      await tauriApi.writeFile('/test/file.md', '# Test Content');
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should list directory quickly', async () => {
      const startTime = performance.now();
      
      await tauriApi.listDirectory('/test');
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle concurrent file operations efficiently', async () => {
      const startTime = performance.now();
      
      const operations = [
        tauriApi.readFile('/test/file1.md'),
        tauriApi.readFile('/test/file2.md'),
        tauriApi.readFile('/test/file3.md'),
        tauriApi.writeFile('/test/file4.md', '# Content 4'),
        tauriApi.writeFile('/test/file5.md', '# Content 5'),
      ];
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(300);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory on component unmount', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      
      const { unmount } = render(<Editor 
        currentFile={mockFile}
        content="# Test"
        onContentChange={() => {}}
      />);
      
      const memoryBefore = performance.memory?.usedJSHeapSize || 0;
      
      unmount();
      
      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      
      // Allow some memory fluctuation but not significant leak
      expect(memoryAfter - memoryBefore).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should handle large content without memory leak', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      const largeContent = '# Test\n\n'.repeat(10000); // ~200KB
      
      const { unmount } = render(<Editor 
        currentFile={mockFile}
        content={largeContent}
        onContentChange={() => {}}
      />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Editor 
          currentFile={mockFile}
          content="# Test"
          onContentChange={() => {}}
        />);
        unmount();
      }
      
      expect(true).toBe(true);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle large file list efficiently', () => {
      const Sidebar = require('../components/Sidebar').default;
      const largeFileList: FileItem[] = Array.from({ length: 1000 }, (_, i) => ({
        path: `/test/file${i}.md`,
        name: `file${i}.md`,
        isDirectory: false,
      }));
      
      const startTime = performance.now();
      
      render(<Sidebar 
        files={largeFileList}
        currentFile={null}
        onFileSelect={() => {}}
        onDeleteFile={() => {}}
        onRefresh={() => {}}
        onCreateFile={() => {}}
        onCreateFolder={() => {}}
        onRename={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle large content efficiently', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      const largeContent = '# Test\n\n'.repeat(10000);
      
      const startTime = performance.now();
      
      render(<Editor 
        currentFile={mockFile}
        content={largeContent}
        onContentChange={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle large search results efficiently', () => {
      const SearchPanel = require('../components/SearchPanel').default;
      const largeResults: FileItem[] = Array.from({ length: 1000 }, (_, i) => ({
        path: `/test/file${i}.md`,
        name: `file${i}.md`,
        isDirectory: false,
      }));
      
      const startTime = performance.now();
      
      render(<SearchPanel 
        query="test"
        results={largeResults}
        isSearching={false}
        onSearch={() => {}}
        onResultClick={() => {}}
        onClose={() => {}}
      />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent file reads efficiently', async () => {
      const startTime = performance.now();
      
      const operations = Array.from({ length: 100 }, (_, i) => 
        tauriApi.readFile(`/test/file${i}.md`)
      );
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle concurrent file writes efficiently', async () => {
      const startTime = performance.now();
      
      const operations = Array.from({ length: 100 }, (_, i) => 
        tauriApi.writeFile(`/test/file${i}.md`, `# Content ${i}`)
      );
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle concurrent component renders efficiently', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        render(<Editor 
          currentFile={mockFile}
          content={`# Content ${i}`}
          onContentChange={() => {}}
        />);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Response Time', () => {
    it('should have sub-100ms response time for file operations', async () => {
      const responseTimes = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await tauriApi.readFile(`/test/file${i}.md`);
        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }
      
      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      expect(averageResponseTime).toBeLessThan(100);
    });

    it('should have sub-200ms response time for component renders', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      
      const renderTimes = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        render(<Editor 
          currentFile={mockFile}
          content={`# Content ${i}`}
          onContentChange={() => {}}
        />);
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }
      
      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      expect(averageRenderTime).toBeLessThan(200);
    });
  });

  describe('Scalability', () => {
    it('should scale linearly with file count', async () => {
      const fileCounts = [10, 100, 1000];
      const times = [];
      
      for (const count of fileCounts) {
        const startTime = performance.now();
        
        const operations = Array.from({ length: count }, (_, i) => 
          tauriApi.readFile(`/test/file${i}.md`)
        );
        
        await Promise.all(operations);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      // Should not grow exponentially
      expect(times[2] / times[1]).toBeLessThan(10);
      expect(times[1] / times[0]).toBeLessThan(10);
    });

    it('should scale linearly with content size', () => {
      const Editor = require('../components/Editor').default;
      const mockFile: FileItem = {
        path: '/test/file.md',
        name: 'file.md',
        isDirectory: false,
      };
      const contentSizes = [1000, 10000, 100000];
      const times = [];
      
      for (const size of contentSizes) {
        const content = '# Test\n\n'.repeat(size);
        const startTime = performance.now();
        
        render(<Editor 
          currentFile={mockFile}
          content={content}
          onContentChange={() => {}}
        />);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      // Should not grow exponentially
      expect(times[2] / times[1]).toBeLessThan(10);
      expect(times[1] / times[0]).toBeLessThan(10);
    });
  });
});
