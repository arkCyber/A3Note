# A3Note 全面功能测试执行计划
## Comprehensive Functional Test Execution Plan

**测试日期**: 2026-03-21  
**测试范围**: 全部功能  
**测试标准**: 航空航天级别

---

## 📋 测试执行步骤

### 阶段 1: 环境准备

#### 1.1 安装依赖
```bash
cd /Users/arksong/Obsidian/A3Note

# 安装前端依赖
npm install

# 验证 Rust 工具链
rustc --version
cargo --version
```

**预期结果**: 所有依赖成功安装，无错误

#### 1.2 验证配置
```bash
# 检查 TypeScript 配置
npx tsc --noEmit

# 检查 ESLint 配置
npm run lint

# 检查 Rust 配置
cd src-tauri && cargo check
```

**预期结果**: 所有配置检查通过

---

### 阶段 2: Rust 后端测试

#### 2.1 单元测试
```bash
cd src-tauri

# 运行所有单元测试
cargo test --lib

# 运行特定模块测试
cargo test error::tests
cargo test commands::tests
cargo test export::tests
cargo test watcher::tests
```

**测试覆盖**:
- [x] 错误处理模块 (8 个测试)
- [x] 命令处理模块 (20+ 个测试)
- [x] 导出功能模块 (10+ 个测试)
- [x] 文件监控模块 (2 个测试)

**预期结果**: 所有测试通过，覆盖率 ≥90%

#### 2.2 集成测试
```bash
cd src-tauri

# 运行集成测试
cargo test --test integration_test
```

**测试场景**:
- [x] 工作区生命周期
- [x] 文件操作工作流
- [x] 并发操作安全性
- [x] 错误恢复机制
- [x] 大规模数据处理
- [x] 原子写入安全性

**预期结果**: 所有集成测试通过

#### 2.3 性能基准测试
```bash
cd src-tauri

# 运行性能基准测试
cargo bench
```

**基准测试项目**:
- [x] 文件读取性能 (1KB - 1MB)
- [x] 文件写入性能 (1KB - 1MB)
- [x] 原子写入性能
- [x] 目录列表性能 (10 - 1000 文件)
- [x] 搜索性能 (100 文件)

**预期结果**: 所有操作 <100ms

#### 2.4 代码质量检查
```bash
cd src-tauri

# 格式化检查
cargo fmt -- --check

# Clippy 检查
cargo clippy -- -D warnings

# 安全审计
cargo audit
```

**预期结果**: 
- 格式化: 通过
- Clippy: 零警告
- 安全审计: 零漏洞

---

### 阶段 3: TypeScript 前端测试

#### 3.1 类型检查
```bash
# TypeScript 类型检查
npm run type-check
```

**预期结果**: 零类型错误

#### 3.2 单元测试
```bash
# 运行所有单元测试
npm test

# 运行特定测试
npm test -- useWorkspace.test.ts
npm test -- useFile.test.ts
npm test -- MarkdownPreview.test.tsx
npm test -- Settings.test.tsx
```

**测试覆盖**:
- [x] useWorkspace Hook (10 个测试)
- [x] useFile Hook (12 个测试)
- [x] MarkdownPreview 组件 (8 个测试)
- [x] Settings 组件 (10 个测试)

**预期结果**: 所有测试通过，覆盖率 ≥80%

#### 3.3 代码覆盖率
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看报告
open coverage/index.html
```

**覆盖率目标**:
- 语句覆盖率: ≥80%
- 分支覆盖率: ≥75%
- 函数覆盖率: ≥80%
- 行覆盖率: ≥80%

**预期结果**: 所有指标达标

#### 3.4 代码质量检查
```bash
# ESLint 检查
npm run lint

# Prettier 格式检查
npm run format:check
```

**预期结果**:
- ESLint: 零错误，零警告
- Prettier: 格式正确

---

### 阶段 4: E2E 测试

#### 4.1 准备测试环境
```bash
# 安装 Playwright 浏览器
npx playwright install --with-deps
```

#### 4.2 运行 E2E 测试
```bash
# 运行所有 E2E 测试
npm run test:e2e

# 运行特定浏览器测试
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

**测试场景**:
- [x] 应用启动和加载
- [x] 欢迎屏幕显示
- [x] 键盘快捷键
- [x] 响应式设计
- [x] 无障碍访问
- [x] 性能指标
- [x] 跨浏览器兼容性

**预期结果**: 所有 E2E 测试通过

#### 4.3 查看测试报告
```bash
# 查看 Playwright 报告
npx playwright show-report
```

---

### 阶段 5: 功能验证测试

#### 5.1 核心功能测试

**文件管理功能**:
- [ ] 打开工作区
- [ ] 创建新文件
- [ ] 打开文件
- [ ] 编辑文件
- [ ] 保存文件
- [ ] 删除文件
- [ ] 刷新文件列表

**编辑器功能**:
- [ ] Markdown 语法高亮
- [ ] 自动保存 (2秒)
- [ ] 脏状态指示
- [ ] 键盘快捷键 (Cmd+S, Cmd+N, Cmd+B)

**搜索功能**:
- [ ] 全文搜索
- [ ] 搜索结果显示
- [ ] 点击结果打开文件

**高级功能**:
- [ ] Markdown 预览
- [ ] 设置管理
- [ ] 导出 HTML
- [ ] 导出纯文本
- [ ] 文件监控

#### 5.2 边界条件测试

**文件大小**:
- [ ] 空文件 (0 bytes)
- [ ] 小文件 (1KB)
- [ ] 中等文件 (1MB)
- [ ] 大文件 (10MB)
- [ ] 超大文件 (100MB - 应达到限制)
- [ ] 过大文件 (>100MB - 应拒绝)

**文件名**:
- [ ] 正常文件名
- [ ] 特殊字符 (应拒绝)
- [ ] 保留名称 (应拒绝)
- [ ] 空文件名 (应拒绝)
- [ ] 超长文件名

**文件类型**:
- [ ] .md 文件 (应接受)
- [ ] .markdown 文件 (应接受)
- [ ] .txt 文件 (应接受)
- [ ] .exe 文件 (应拒绝)
- [ ] .sh 文件 (应拒绝)

**路径安全**:
- [ ] 正常路径
- [ ] 相对路径 ../
- [ ] 绝对路径
- [ ] 符号链接

#### 5.3 性能测试

**响应时间**:
- [ ] 应用启动 <3s
- [ ] 文件打开 <10ms
- [ ] 文件保存 <20ms
- [ ] 搜索响应 <100ms
- [ ] UI 渲染 <16ms

**资源使用**:
- [ ] 内存占用 <500MB
- [ ] CPU 占用 <30%
- [ ] 磁盘 I/O 合理

#### 5.4 错误处理测试

**文件操作错误**:
- [ ] 文件不存在
- [ ] 权限不足
- [ ] 磁盘已满
- [ ] 文件被锁定

**网络错误** (如适用):
- [ ] 连接超时
- [ ] 网络中断

**用户输入错误**:
- [ ] 无效路径
- [ ] 无效文件名
- [ ] 无效内容

---

### 阶段 6: 安全测试

#### 6.1 输入验证测试
- [ ] 路径遍历攻击 (../)
- [ ] 文件名注入
- [ ] 内容注入
- [ ] XSS 攻击 (在预览中)

#### 6.2 文件系统安全
- [ ] 只读文件保护
- [ ] 系统文件保护
- [ ] 权限检查

---

### 阶段 7: 兼容性测试

#### 7.1 操作系统兼容性
- [ ] macOS (主要平台)
- [ ] Windows (如可用)
- [ ] Linux (如可用)

#### 7.2 浏览器兼容性 (E2E)
- [ ] Chromium
- [ ] Firefox
- [ ] WebKit

---

## 📊 测试结果记录

### 测试执行记录表

| 测试阶段 | 测试项 | 通过 | 失败 | 跳过 | 状态 |
|---------|--------|------|------|------|------|
| Rust 单元测试 | 40+ | - | - | - | ⏳ |
| Rust 集成测试 | 6 | - | - | - | ⏳ |
| Rust 性能测试 | 5 | - | - | - | ⏳ |
| TS 单元测试 | 40+ | - | - | - | ⏳ |
| E2E 测试 | 10+ | - | - | - | ⏳ |
| 功能验证 | 30+ | - | - | - | ⏳ |
| 安全测试 | 10+ | - | - | - | ⏳ |

### 缺陷记录表

| ID | 严重性 | 描述 | 状态 | 修复版本 |
|----|--------|------|------|---------|
| - | - | - | - | - |

---

## ✅ 测试通过标准

### 必须通过:
- [x] 所有单元测试通过
- [x] 所有集成测试通过
- [x] 代码覆盖率 ≥80%
- [x] 零安全漏洞
- [x] 零代码警告
- [x] 性能指标达标

### 建议通过:
- [x] E2E 测试通过率 ≥95%
- [x] 功能验证 100%
- [x] 安全测试 100%

---

## 🚀 测试执行命令快速参考

```bash
# 完整测试套件
npm run validate

# 仅 Rust 测试
cd src-tauri && cargo test

# 仅前端测试
npm test

# 覆盖率报告
npm run test:coverage

# E2E 测试
npm run test:e2e

# 性能基准
cd src-tauri && cargo bench

# 代码质量
npm run lint && cd src-tauri && cargo clippy
```

---

## 📞 测试支持

遇到测试问题:
1. 查看测试日志
2. 检查测试文档 (TESTING.md)
3. 运行调试模式
4. 提交 Issue

---

**测试准备完成，等待执行！** 🧪

**下一步**: 运行 `npm install` 然后开始测试执行
