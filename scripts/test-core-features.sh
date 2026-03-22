#!/bin/bash

# A3Note Core Features Test Script
# This script runs comprehensive tests on the A3Note application

set -e

echo "🧪 A3Note 核心功能测试"
echo "===================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "📦 1. 依赖检查"
echo "-------------"
run_test "Node.js installed" "command -v node"
run_test "npm installed" "command -v npm"
run_test "Rust installed" "command -v cargo"
run_test "Tauri CLI installed" "command -v cargo-tauri"
echo ""

echo "🔍 2. 代码质量检查"
echo "----------------"
run_test "TypeScript type check" "npm run type-check"
run_test "ESLint check" "npm run lint"
echo ""

echo "🧪 3. 单元测试"
echo "------------"
run_test "All unit tests" "npm test -- --run"
echo ""

echo "📊 4. 测试覆盖率"
echo "--------------"
if npm run test:coverage -- --run > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Coverage report generated${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠ Coverage report skipped${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

echo "🏗️  5. 构建测试"
echo "-------------"
run_test "Frontend build" "npm run build"
echo ""

echo "📁 6. 文件结构检查"
echo "----------------"
run_test "Source directory exists" "test -d src"
run_test "Components directory exists" "test -d src/components"
run_test "Hooks directory exists" "test -d src/hooks"
run_test "Plugins directory exists" "test -d src/plugins"
run_test "Tests directory exists" "test -d src/__tests__"
run_test "Tauri source exists" "test -d src-tauri"
echo ""

echo "📝 7. 配置文件检查"
echo "----------------"
run_test "package.json exists" "test -f package.json"
run_test "tsconfig.json exists" "test -f tsconfig.json"
run_test "vite.config.ts exists" "test -f vite.config.ts"
run_test "vitest.config.ts exists" "test -f vitest.config.ts"
run_test "tailwind.config.js exists" "test -f tailwind.config.js"
run_test "tauri.conf.json exists" "test -f src-tauri/tauri.conf.json"
echo ""

echo "🎨 8. 资源文件检查"
echo "----------------"
run_test "Icons directory exists" "test -d src-tauri/icons"
run_test "App icon exists" "test -f src-tauri/icons/icon.png"
run_test "i18n files exist" "test -d src/i18n/locales"
echo ""

echo ""
echo "===================="
echo "📊 测试总结"
echo "===================="
echo "总测试数: $TOTAL_TESTS"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败: ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate pass rate
PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "通过率: $PASS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED_TESTS 个测试失败${NC}"
    exit 1
fi
