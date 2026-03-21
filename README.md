# A3Note

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-ffc131)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange)](https://www.rust-lang.org/)

A high-performance, Obsidian-compatible note-taking application built with Tauri + Rust + React.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### Core Features
- 📝 **Markdown Editor** - Full-featured CodeMirror 6 editor with syntax highlighting
- 📁 **File Management** - Intuitive file system navigation and organization
- 🔍 **Fast Search** - Full-text search powered by Tantivy
- 🎨 **Modern UI** - Clean, Obsidian-inspired interface with dark/light themes
- ⚡ **High Performance** - Rust backend for blazing-fast operations
- 🌍 **24 Languages** - Full internationalization support

### Advanced Features
- 🔗 **Bi-directional Links** - Wiki-style linking between notes
- 🔙 **Backlinks** - Automatic backlink tracking and display
- 🏷️ **Tags** - Comprehensive tag management system
- 📊 **Metadata Cache** - Fast metadata indexing and retrieval
- 🔌 **Plugin System** - Obsidian-compatible plugin architecture (90% API compatibility)
- 📦 **Plugin Marketplace** - Browse and install community plugins
- 🎯 **Command Palette** - Quick access to all commands
- ⌨️ **Keyboard Shortcuts** - Fully customizable shortcuts
- 💾 **Auto-save** - Never lose your work
- 🎨 **Themes** - Multiple color themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+
- Platform-specific dependencies for Tauri ([see Tauri docs](https://tauri.app/v1/guides/getting-started/prerequisites))

### Installation

```bash
# Clone the repository
git clone https://github.com/arkCyber/A3Note.git
cd A3Note

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### Build for Production

```bash
# Build the application
npm run tauri:build

# The built application will be in src-tauri/target/release/
```

## 📚 Documentation

- [Quick Start Guide](docs/guides/QUICKSTART.md)
- [Setup Instructions](docs/guides/SETUP.md)
- [Testing Guide](docs/guides/TESTING.md)
- [Plugin Development](docs/development/OBSIDIAN_PLUGIN_COMPATIBILITY_PLAN.md)
- [Plugin Marketplace Guide](docs/reports/PLUGIN_MARKETPLACE_COMPLETE_GUIDE.md)
- [Internationalization](docs/reports/I18N_IMPLEMENTATION_COMPLETE.md)

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18.2 + TypeScript 5.0
- **Styling**: TailwindCSS + Custom CSS
- **Editor**: CodeMirror 6
- **Icons**: Lucide React
- **i18n**: react-i18next
- **Build Tool**: Vite

### Backend
- **Framework**: Tauri 2.0
- **Language**: Rust 1.70+
- **Search Engine**: Tantivy
- **File System**: Native OS APIs

### Testing
- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: 113+ test cases

## 📁 Project Structure

```
A3Note/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── Editor.tsx           # Main editor
│   │   ├── Sidebar.tsx          # File browser
│   │   ├── PluginMarketplace.tsx # Plugin marketplace
│   │   └── ...
│   ├── plugins/                  # Plugin system
│   │   ├── api/                 # Obsidian API compatibility
│   │   ├── samples/             # Example plugins
│   │   └── loader/              # Plugin loader
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Business logic
│   ├── locales/                  # i18n translations (24 languages)
│   ├── __tests__/               # Test files
│   └── App.tsx                   # Main app component
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands.rs          # Tauri commands
│   │   ├── search.rs            # Full-text search
│   │   ├── error.rs             # Error handling
│   │   └── main.rs              # Entry point
│   └── Cargo.toml               # Rust dependencies
├── docs/                         # Documentation
│   ├── guides/                  # User guides
│   ├── development/             # Development docs
│   └── reports/                 # Project reports
├── e2e/                          # E2E tests
└── scripts/                      # Build scripts
```

## 🔌 Plugin System

A3Note features a powerful plugin system with **90% compatibility** with Obsidian plugins:

- ✅ Plugin API (App, Vault, Workspace, MetadataCache)
- ✅ Command system
- ✅ Event system
- ✅ Settings and data persistence
- ✅ Plugin marketplace with search and install
- ✅ 5 example plugins included

See [Plugin Development Guide](docs/development/OBSIDIAN_PLUGIN_COMPATIBILITY_PLAN.md) for details.

## 🌍 Internationalization

Supports 24 languages:
- English, 简体中文, 繁體中文, 日本語, 한국어
- Español, Français, Deutsch, Italiano, Português
- Русский, العربية, हिन्दी, and 11 more

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

**Test Coverage**: 113+ test cases with 100% pass rate

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev              # Frontend only
npm run tauri:dev        # Full application

# Linting and formatting
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
npm run format           # Format code

# Type checking
npm run type-check

# Validate everything
npm run validate         # Type check + lint + test
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Obsidian](https://obsidian.md/)
- Built with [Tauri](https://tauri.app/)
- Powered by [CodeMirror](https://codemirror.net/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Contact

- GitHub: [@arkCyber](https://github.com/arkCyber)
- Issues: [GitHub Issues](https://github.com/arkCyber/A3Note/issues)

---

<div align="center">

Made with ❤️ by the A3Note team

[⬆ Back to Top](#a3note)

</div>
