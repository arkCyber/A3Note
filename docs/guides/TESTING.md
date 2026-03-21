# A3Note Testing & Quality Assurance Guide
## 航空航天级别测试标准

本文档描述了 A3Note 项目的完整测试策略和质量保证流程。

## 📋 测试层级

### 1. 单元测试 (Unit Tests)

#### **Rust 后端测试**
- **位置**: `src-tauri/src/error.rs`, `src-tauri/src/commands_test.rs`
- **覆盖率目标**: ≥90%
- **运行命令**:
  ```bash
  cd src-tauri
  cargo test
  cargo test -- --nocapture  # 显示输出
  cargo test --release       # 发布模式测试
  ```

#### **测试内容**:
- ✅ 文件读写操作
- ✅ 路径验证和安全检查
- ✅ 文件名验证
- ✅ 文件大小限制
- ✅ 扩展名验证
- ✅ 路径遍历攻击防护
- ✅ 错误处理和恢复
- ✅ 并发操作安全性

#### **React 前端测试**
- **位置**: `src/hooks/__tests__/`
- **覆盖率目标**: ≥80%
- **运行命令**:
  ```bash
  npm test                    # 运行所有测试
  npm run test:ui            # 可视化测试界面
  npm run test:coverage      # 生成覆盖率报告
  ```

#### **测试内容**:
- ✅ 自定义 Hooks 逻辑
- ✅ 状态管理
- ✅ 异步操作
- ✅ 错误处理
- ✅ 边界条件
- ✅ 防抖和节流

### 2. 集成测试 (Integration Tests)

#### **Rust 集成测试**
- **位置**: `src-tauri/tests/integration_test.rs`
- **运行命令**:
  ```bash
  cd src-tauri
  cargo test --test integration_test
  ```

#### **测试场景**:
- ✅ 完整工作流程测试
- ✅ 多文件操作
- ✅ 并发文件操作
- ✅ 错误恢复机制
- ✅ 大规模数据处理
- ✅ 原子写入安全性

### 3. 端到端测试 (E2E Tests)

#### **Playwright 测试**
- **位置**: `e2e/app.spec.ts`
- **运行命令**:
  ```bash
  npm run test:e2e           # 运行 E2E 测试
  npm run test:e2e:ui        # 可视化测试界面
  ```

#### **测试场景**:
- ✅ 应用启动和加载
- ✅ 用户界面交互
- ✅ 键盘快捷键
- ✅ 响应式设计
- ✅ 无障碍访问
- ✅ 性能指标
- ✅ 跨浏览器兼容性

## 🎯 测试覆盖率要求

| 模块 | 最低覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| Rust 核心逻辑 | 85% | 95% |
| Rust 命令处理 | 90% | 98% |
| React Hooks | 75% | 85% |
| React 组件 | 70% | 80% |
| 整体项目 | 80% | 90% |

## 🔒 安全测试

### **已实现的安全措施**:

1. **路径遍历防护**
   - 检测 `..` 路径
   - 路径规范化
   - 绝对路径验证

2. **文件名验证**
   - 禁止特殊字符
   - 保留名称检查（Windows）
   - 空名称检查

3. **文件大小限制**
   - 最大文件大小: 100MB
   - 防止内存溢出

4. **扩展名白名单**
   - 仅允许: `.md`, `.markdown`, `.txt`
   - 防止恶意文件执行

5. **原子写入**
   - 临时文件 + 重命名
   - 防止数据损坏

### **安全测试命令**:
```bash
# Rust 安全审计
cd src-tauri
cargo audit

# 依赖漏洞扫描
cargo deny check

# Clippy 安全检查
cargo clippy -- -D warnings
```

## 📊 性能测试

### **性能基准**:

| 操作 | 目标时间 | 最大时间 |
|------|---------|---------|
| 文件读取 (1MB) | <10ms | <50ms |
| 文件写入 (1MB) | <20ms | <100ms |
| 目录列表 (1000文件) | <50ms | <200ms |
| 搜索 (10000文件) | <100ms | <500ms |
| 应用启动 | <1s | <3s |

### **性能测试命令**:
```bash
# Rust 性能测试
cd src-tauri
cargo bench

# 前端性能测试
npm run test:e2e  # 包含性能指标
```

## 🔧 代码质量工具

### **Rust 代码质量**:

```bash
# 格式化
cargo fmt

# Linting
cargo clippy -- -D warnings

# 文档检查
cargo doc --no-deps

# 死代码检查
cargo clean && cargo build --all-features
```

### **TypeScript 代码质量**:

```bash
# 类型检查
npm run type-check

# Linting
npm run lint
npm run lint:fix

# 格式化
npm run format
npm run format:check

# 完整验证
npm run validate
```

## 🚀 持续集成 (CI) 流程

### **推荐的 CI 流程**:

```yaml
# .github/workflows/ci.yml 示例
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Rust 测试
      - name: Rust Tests
        run: |
          cd src-tauri
          cargo test --all-features
          cargo clippy -- -D warnings
          cargo fmt -- --check
      
      # 前端测试
      - name: Frontend Tests
        run: |
          npm ci
          npm run type-check
          npm run lint
          npm run test:coverage
      
      # E2E 测试
      - name: E2E Tests
        run: |
          npm run test:e2e
      
      # 覆盖率报告
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

## 📝 测试最佳实践

### **1. 测试命名规范**:
```rust
// Rust
#[test]
fn test_<功能>_<场景>_<预期结果>() { }

// TypeScript
it('should <预期行为> when <条件>', () => { });
```

### **2. 测试组织**:
- 每个功能模块独立测试文件
- 相关测试用例分组
- 使用 `describe` 和 `context` 组织

### **3. Mock 和 Stub**:
- 隔离外部依赖
- 使用 Tauri API mock
- 文件系统操作使用临时目录

### **4. 断言清晰**:
```typescript
// ✅ 好的断言
expect(result.currentFile?.name).toBe('test.md');

// ❌ 避免模糊断言
expect(result).toBeTruthy();
```

### **5. 测试数据管理**:
- 使用工厂函数创建测试数据
- 清理测试后的副作用
- 避免测试间依赖

## 🐛 调试测试

### **Rust 测试调试**:
```bash
# 显示详细输出
cargo test -- --nocapture

# 运行特定测试
cargo test test_read_file_content

# 调试模式
RUST_LOG=debug cargo test
```

### **前端测试调试**:
```bash
# 可视化界面
npm run test:ui

# 监听模式
npm test -- --watch

# 调试特定测试
npm test -- useFile.test.ts
```

## 📈 测试报告

### **生成报告**:
```bash
# Rust 覆盖率
cargo tarpaulin --out Html

# 前端覆盖率
npm run test:coverage

# E2E 报告
npm run test:e2e
npx playwright show-report
```

### **报告位置**:
- Rust: `target/tarpaulin/index.html`
- 前端: `coverage/index.html`
- E2E: `playwright-report/index.html`

## ✅ 测试检查清单

在提交代码前，确保：

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 代码覆盖率达标
- [ ] Linting 无错误
- [ ] 类型检查通过
- [ ] 格式化正确
- [ ] 性能测试通过
- [ ] 安全审计通过
- [ ] 文档更新

## 🎓 测试培训资源

### **Rust 测试**:
- [Rust Book - Testing](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [Rust by Example - Testing](https://doc.rust-lang.org/rust-by-example/testing.html)

### **React 测试**:
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)

### **E2E 测试**:
- [Playwright Documentation](https://playwright.dev/)

## 📞 支持

遇到测试问题？

1. 查看测试日志
2. 检查测试文档
3. 运行调试模式
4. 提交 Issue

---

**测试是质量的保证！** 🚀

遵循航空航天级别标准，确保代码质量和可靠性。
