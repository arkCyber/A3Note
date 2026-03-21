# A3Note Setup Guide

## Prerequisites

- Node.js (v18 or later)
- Rust (latest stable)
- npm or pnpm

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

   This will:
   - Start the Vite dev server (React frontend)
   - Compile the Rust backend
   - Launch the Tauri application window

3. **Build for production**
   ```bash
   npm run tauri:build
   ```

## Project Structure

```
A3Note/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── Editor.tsx           # CodeMirror markdown editor
│   │   ├── Sidebar.tsx          # File tree navigation
│   │   └── Toolbar.tsx          # Top toolbar
│   ├── types/                   # TypeScript type definitions
│   ├── styles/                  # CSS styles
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── commands.rs          # Tauri commands (file operations)
│   │   ├── models.rs            # Data models
│   │   ├── search.rs            # Search engine (Tantivy)
│   │   └── main.rs              # Entry point
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── package.json                 # Node dependencies
└── vite.config.ts               # Vite configuration
```

## Features Implemented

✅ **Core UI**
- Modern dark theme inspired by Obsidian
- Responsive layout with sidebar and editor
- Toolbar with navigation controls

✅ **Markdown Editor**
- CodeMirror 6 integration
- Syntax highlighting
- Line wrapping
- Auto-save support (TODO: connect to backend)

✅ **File System (Rust Backend)**
- Read/write file content
- List directory structure
- Create/delete files and folders
- Recursive directory loading

✅ **Search**
- Basic text search in markdown files
- Full-text search engine ready (Tantivy)

## Next Steps

### Phase 1: Core Functionality
- [ ] Connect frontend to Rust backend commands
- [ ] Implement file tree loading from disk
- [ ] Add file creation/deletion UI
- [ ] Implement auto-save functionality
- [ ] Add keyboard shortcuts

### Phase 2: Advanced Features
- [ ] Bi-directional linking (`[[link]]` syntax)
- [ ] Graph view for note connections
- [ ] Tag system
- [ ] Advanced search with filters
- [ ] File watcher for external changes

### Phase 3: Plugin System
- [ ] Define plugin API
- [ ] JavaScript plugin loader
- [ ] Plugin marketplace UI
- [ ] Example plugins

## Development Tips

1. **Hot Reload**: Changes to React code will hot-reload automatically
2. **Rust Changes**: Require app restart (Ctrl+C and re-run `npm run tauri:dev`)
3. **Debugging**: Use browser DevTools (Cmd+Option+I on macOS)
4. **Logs**: Rust logs appear in terminal, JS logs in DevTools console

## Architecture Decisions

### Why Tauri + Rust?
- **Performance**: Rust backend handles file I/O and search efficiently
- **Small Bundle**: ~10MB vs 100MB+ for Electron
- **Security**: Rust's memory safety prevents common vulnerabilities
- **Native Feel**: True native window and system integration

### Why CodeMirror 6?
- **Modern**: Built with TypeScript, excellent performance
- **Extensible**: Rich plugin ecosystem
- **Markdown**: First-class markdown support
- **Mobile-Ready**: Touch-friendly (future mobile support)

### Why Tantivy?
- **Fast**: Written in Rust, optimized for speed
- **Full-Text**: Advanced search capabilities
- **Lightweight**: No external dependencies
- **Lucene-like**: Familiar API for search features

## Troubleshooting

### Build Errors
- Ensure Rust is installed: `rustc --version`
- Update Rust: `rustup update`
- Clear cache: `rm -rf node_modules src-tauri/target && npm install`

### Icon Errors
- Icons are not included yet
- Generate with: `npm run tauri icon path/to/512x512.png`

### Port Already in Use
- Change port in `vite.config.ts` (default: 1420)
- Or kill existing process: `lsof -ti:1420 | xargs kill`

## Contributing

This is an early-stage project. Contributions welcome!

## License

MIT
