#!/bin/bash

# 每日監控腳本 (Daily Monitor Script)
# 用途: 自動化執行每日檢查
# 執行: ./daily-monitor.sh [11-11|11-12|11-14]

set -e

DATE=${1:-$(date +%m-%d)}
LOG_FILE="/tmp/daily-report-${DATE}.log"
REPORT_FILE="/tmp/repo/daily-reports/report-${DATE}.md"

echo "🔍 開始每日監控 ($DATE)" | tee -a "$LOG_FILE"
echo "=" | tee -a "$LOG_FILE"

# 1. 系統狀態檢查
echo "📊 1. 系統狀態檢查..." | tee -a "$LOG_FILE"

# GitHub Pages 可訪問性
if curl -s -f https://t8661360-jpg.github.io/pingtung-civil-groups/ > /dev/null; then
    echo "  ✅ GitHub Pages: 可訪問" | tee -a "$LOG_FILE"
else
    echo "  ❌ GitHub Pages: 不可訪問 - 警報！" | tee -a "$LOG_FILE"
fi

# GitHub 連接狀態
if curl -s -f https://api.github.com/repos/t8661360-jpg/pingtung-civil-groups > /dev/null; then
    echo "  ✅ GitHub API: 連接正常" | tee -a "$LOG_FILE"
else
    echo "  ❌ GitHub API: 連接失敗 - 警報！" | tee -a "$LOG_FILE"
fi

# 2. 代碼倉庫檢查
echo "" | tee -a "$LOG_FILE"
echo "📦 2. 代碼倉庫檢查..." | tee -a "$LOG_FILE"

cd /tmp/repo

# 取最後一次提交
LAST_COMMIT=$(git log -1 --format="%h - %s (%ar)")
echo "  最後提交: $LAST_COMMIT" | tee -a "$LOG_FILE"

# 檢查未提交的更改
CHANGES=$(git status --short | wc -l)
if [ "$CHANGES" -gt 0 ]; then
    echo "  ⚠️  未提交更改: $CHANGES 個檔案" | tee -a "$LOG_FILE"
    echo "  未提交檔案:" | tee -a "$LOG_FILE"
    git status --short | sed 's/^/    /' | tee -a "$LOG_FILE"
else
    echo "  ✅ 工作區乾淨" | tee -a "$LOG_FILE"
fi

# 3. 檔案大小檢查
echo "" | tee -a "$LOG_FILE"
echo "📄 3. 檔案大小檢查..." | tee -a "$LOG_FILE"

echo "  index.html: $(wc -l < index.html) 行" | tee -a "$LOG_FILE"
echo "  round-fixes.js: $(wc -l < round-fixes.js) 行" | tee -a "$LOG_FILE"
echo "  feedback-collector.js: $(wc -l < feedback-collector.js) 行" | tee -a "$LOG_FILE"
echo "  feedback-github-poster.js: $(wc -l < feedback-github-poster.js) 行" | tee -a "$LOG_FILE"

# 4. 測試檢查
echo "" | tee -a "$LOG_FILE"
echo "🧪 4. 測試檢查..." | tee -a "$LOG_FILE"

# 執行反饋系統測試
if node test-feedback-processor.cjs > /tmp/test-result.txt 2>&1; then
    PASS_COUNT=$(grep "✅ 通過:" /tmp/test-result.txt | grep -oE '[0-9]+' | head -1)
    echo "  ✅ 反饋系統測試: $PASS_COUNT/17 通過" | tee -a "$LOG_FILE"
else
    echo "  ❌ 反饋系統測試: 失敗" | tee -a "$LOG_FILE"
fi

# 5. 文檔檢查
echo "" | tee -a "$LOG_FILE"
echo "📚 5. 文檔檢查..." | tee -a "$LOG_FILE"

DOCS=(
    "docs/user-guide.md"
    "docs/deployment-checklist.md"
    "docs/acceptance-test-cases.md"
    "NEXT_STEPS.md"
    "PROJECT_STATUS.md"
    "MILESTONES.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        echo "  ✅ $doc: $LINES 行" | tee -a "$LOG_FILE"
    else
        echo "  ❌ $doc: 缺失" | tee -a "$LOG_FILE"
    fi
done

# 6. 工作流檢查
echo "" | tee -a "$LOG_FILE"
echo "⚙️  6. 工作流檢查..." | tee -a "$LOG_FILE"

if [ -f ".github/workflows/feedback-sync.yml" ]; then
    echo "  ✅ feedback-sync.yml: 存在" | tee -a "$LOG_FILE"
    grep "schedule:" .github/workflows/feedback-sync.yml | head -1 | tee -a "$LOG_FILE"
else
    echo "  ❌ feedback-sync.yml: 缺失" | tee -a "$LOG_FILE"
fi

# 7. 生成報告
echo "" | tee -a "$LOG_FILE"
echo "📋 生成每日報告..." | tee -a "$LOG_FILE"

mkdir -p daily-reports

cat > "$REPORT_FILE" << REPORT_EOF
# 每日監控報告 - $DATE

**生成時間**: $(date '+%Y-%m-%d %H:%M:%S')  
**報告路徑**: $REPORT_FILE

## 系統狀態

### GitHub Pages
- 狀態: $(curl -s -f https://t8661360-jpg.github.io/pingtung-civil-groups/ > /dev/null && echo "✅ 可訪問" || echo "❌ 不可訪問")

### GitHub API
- 狀態: $(curl -s -f https://api.github.com/repos/t8661360-jpg/pingtung-civil-groups > /dev/null && echo "✅ 連接正常" || echo "❌ 連接失敗")

## 代碼倉庫

### 最後提交
$LAST_COMMIT

### 待提交更改
共 $CHANGES 個檔案

## 文檔清單

| 文檔 | 狀態 | 行數 |
|-----|------|------|
REPORT_EOF

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        echo "| $doc | ✅ | $LINES |" >> "$REPORT_FILE"
    else
        echo "| $doc | ❌ | - |" >> "$REPORT_FILE"
    fi
done

cat >> "$REPORT_FILE" << REPORT_EOF

## 測試結果

### 反饋系統測試
$(cat /tmp/test-result.txt | tail -10)

## 工作流

### feedback-sync.yml
$([ -f ".github/workflows/feedback-sync.yml" ] && echo "✅ 存在" || echo "❌ 缺失")

---

**報告完成時間**: $(date '+%Y-%m-%d %H:%M:%S')

