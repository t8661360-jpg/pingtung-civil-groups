#!/bin/bash

# 屏東縣人民團體數位櫃檯 - 每日進度提醒系統
# Daily Reminder System for Sprint 2026-11-11 ~ 2026-11-20

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/DAILY-REMINDERS.log"
EXECUTION_TRACKER="$SCRIPT_DIR/EXECUTION-TRACKER.md"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 時間戳函數
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# 記錄函數
log_message() {
    local message=$1
    echo "[$(timestamp)] $message" >> "$LOG_FILE"
}

# 顯示標題
show_header() {
    clear
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║   屏東縣人民團體數位櫃檯 - 每日進度提醒系統              ║${NC}"
    echo -e "${PURPLE}║   Daily Reminder System for Critical Sprint               ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 早上 9 點提醒 - 站會前
morning_reminder() {
    echo -e "${CYAN}📢 早上 9 點提醒 - 站會準備${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 9:00 AM - 團隊站會即將開始${NC}"
    echo ""
    echo -e "${GREEN}✅ 檢查清單:${NC}"
    echo "  □ 打開 QUICK-START-TODAY.md 查看今日任務"
    echo "  □ 準備 1 分鐘的進度報告"
    echo "  □ 確認連接到會議"
    echo "  □ 查看 EXECUTION-TRACKER.md 了解全局進度"
    echo ""
    echo -e "${BLUE}📋 今日優先任務:${NC}"
    echo "  1️⃣  工作流 B: GitHub Token 配置 (DevOps - CRITICAL!)"
    echo "  2️⃣  工作流 E: 社會處聯繫準備 (Business)"
    echo "  3️⃣  工作流 A: 功能檢查開始 (QA)"
    echo "  4️⃣  工作流 D: 反饻系統 Debug (Backend)"
    echo "  5️⃣  工作流 C: FAQ 框架準備 (Content)"
    echo ""
    log_message "Morning reminder sent at $(date '+%H:%M')"
}

# 上午 11 點檢查 - 工作流 B 進度
midmorning_check() {
    echo -e "${CYAN}📢 上午 11 點檢查 - 工作流 B 進度監控${NC}"
    echo ""
    echo -e "${RED}🔴 CRITICAL PATH - 工作流 B 進度檢查${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 工作流 B 應該在 09:30-11:30 進行${NC}"
    echo ""
    echo -e "${GREEN}✅ DevOps 進度檢查:${NC}"
    echo "  □ GitHub Personal Access Token 已生成?"
    echo "  □ Repository Secrets (GITHUB_TOKEN) 已配置?"
    echo "  □ GitHub Actions 工作流已驗證?"
    echo "  □ 是否有任何 error 或 blocker?"
    echo ""
    echo -e "${BLUE}📝 如果有延遲:${NC}"
    echo "  → 立即向 PM 報告"
    echo "  → 提供詳細的錯誤信息"
    echo "  → 請求技術支援"
    echo "  → 啟用應急預案"
    echo ""
    log_message "Midmorning check for Workflow B at $(date '+%H:%M')"
}

# 中午 12 點同步 - 進度報告
noon_sync() {
    echo -e "${CYAN}📢 中午 12 點進度同步${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 12:00 PM - 團隊進度同步會議${NC}"
    echo ""
    echo -e "${GREEN}✅ 每人 1 分鐘進度報告:${NC}"
    echo ""
    echo "【工作流 A】QA 主管"
    echo "  報告項目: 功能檢查進度、發現的問題"
    echo ""
    echo "【工作流 B】DevOps"
    echo "  報告項目: Token 配置完成度、問題排查"
    echo ""
    echo "【工作流 C】Content"
    echo "  報告項目: FAQ 框架完成度、進度"
    echo ""
    echo "【工作流 D】Backend"
    echo "  報告項目: 反饻系統 Debug 進度、發現的 Bug"
    echo ""
    echo "【工作流 E】Business"
    echo "  報告項目: 郵件準備進度、回應準備"
    echo ""
    echo "【工作流 F】PM"
    echo "  報告項目: 整體進度、風險、資源需求"
    echo ""
    echo -e "${BLUE}📊 需要決策的事項:${NC}"
    echo "  - 是否有超出預期的 Blocker?"
    echo "  - 是否需要資源調整?"
    echo "  - 進度是否符合預期?"
    echo ""
    log_message "Noon sync meeting at $(date '+%H:%M')"
}

# 下午 3 點檢查 - 社會處聯繫準備 (11/11)
afternoon_check() {
    echo -e "${CYAN}📢 下午 3 點檢查 - 工作流 E 進度${NC}"
    echo ""
    echo -e "${RED}🔴 TIME SENSITIVE - 工作流 E 進度檢查${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 明天上午必須發送郵件到社會處${NC}"
    echo ""
    echo -e "${GREEN}✅ Business 進度檢查:${NC}"
    echo "  □ 聯繫信息已收集?"
    echo "  □ 郵件內容已準備?"
    echo "  □ 7 項社區規則清單已整理?"
    echo "  □ 附件已準備 (表單/範例)?"
    echo ""
    echo -e "${BLUE}📝 明天上午的行動計畫:${NC}"
    echo "  09:30 - 確認聯繫人信息"
    echo "  10:00 - 撥打確認電話"
    echo "  10:30 - 發送正式郵件"
    echo "  11:00 - 確認對方收到"
    echo ""
    log_message "Afternoon check for Workflow E at $(date '+%H:%M')"
}

# 下午 5 點 - 日終總結
daily_wrap_up() {
    echo -e "${CYAN}📢 下午 5 點日終總結${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 17:00 - 日終總結會議${NC}"
    echo ""
    echo -e "${GREEN}✅ 會議議程 (20 分鐘):${NC}"
    echo ""
    echo "1️⃣  各工作流 2-3 分鐘成果報告 (12 分鐘)"
    echo "  └─ 完成了什麼?"
    echo "  └─ 遇到了什麼問題?"
    echo "  └─ 明天的計畫?"
    echo ""
    echo "2️⃣  全隊討論 (5 分鐘)"
    echo "  └─ 風險識別"
    echo "  └─ 資源調整"
    echo "  └─ 明日優先級"
    echo ""
    echo "3️⃣  更新進度 (3 分鐘)"
    echo "  └─ 更新 EXECUTION-TRACKER.md"
    echo "  └─ 提交 Git commit"
    echo ""
    echo -e "${BLUE}📝 更新內容:${NC}"
    echo "  - 今日進度百分比"
    echo "  - 已完成的任務"
    echo "  - 遇到的 Blocker"
    echo "  - 明日計畫"
    echo "  - 風險評估"
    echo ""
    log_message "Daily wrap-up at $(date '+%H:%M')"
}

# 晚上 - 檢查清單
evening_checklist() {
    echo -e "${CYAN}📢 晚間檢查清單${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 每日 18:00 - 完整性檢查${NC}"
    echo ""
    echo -e "${GREEN}✅ 下班前檢查:${NC}"
    echo "  □ EXECUTION-TRACKER.md 已更新?"
    echo "  □ 所有 Blocker 都已記錄?"
    echo "  □ Git commit 已推送?"
    echo "  □ 明天的優先任務已確認?"
    echo "  □ 需要的資源已準備?"
    echo "  □ 有任何需要上報的風險嗎?"
    echo ""
    echo -e "${BLUE}📝 準備明天:${NC}"
    echo "  - 查看 QUICK-START-TODAY.md 下一天的任務"
    echo "  - 準備相關工具和環境"
    echo "  - 與相關同事溝通"
    echo ""
    log_message "Evening checklist at $(date '+%H:%M')"
}

# 週末檢查 (11/15)
weekend_check() {
    echo -e "${CYAN}📢 週末前全面檢查${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 11/15 17:00 - 第一階段檢查${NC}"
    echo ""
    echo -e "${GREEN}✅ 第一階段 (11/11-11/15) 檢查:${NC}"
    echo "  □ 反饻系統 100% 功能驗證完成?"
    echo "  □ GitHub Token & CI/CD 配置完成?"
    echo "  □ 文檔 (FAQ/隱私/服務) 完成?"
    echo "  □ 內部用戶測試完成?"
    echo "  □ P0 問題修復完成?"
    echo "  □ 回歸測試 37/37 通過?"
    echo ""
    echo -e "${BLUE}📊 成果統計:${NC}"
    echo "  - 完成工作流: ___ / 6"
    echo "  - 解決問題: P0 ___, P1 ___, P2 ___"
    echo "  - 進度達成: __% (目標 90%)"
    echo ""
    log_message "Weekend check for Phase 1 at $(date '+%H:%M')"
}

# 最終檢查 (11/17)
final_check() {
    echo -e "${CYAN}📢 最終檢查 - 上線前準備${NC}"
    echo ""
    echo -e "${YELLOW}⏰ 11/17 - 最後 3 天檢查${NC}"
    echo ""
    echo -e "${RED}🔴 關鍵里程碑檢查:${NC}"
    echo "  □ 社區規則補充資料已收到?"
    echo "  □ 如未收到，應急預案是否啟動?"
    echo ""
    echo -e "${GREEN}✅ 上線前最終檢查:${NC}"
    echo "  □ 所有 Acceptance Test 通過?"
    echo "  □ 跨瀏覽器相容性驗證完成?"
    echo "  □ 行動裝置測試通過?"
    echo "  □ 性能指標達標?"
    echo "  □ 應急計畫就位?"
    echo ""
    log_message "Final check for launch preparation at $(date '+%H:%M')"
}

# 主程序
main() {
    show_header
    
    # 根據參數選擇提醒類型
    case "${1:-morning}" in
        morning)
            morning_reminder
            ;;
        midmorning)
            midmorning_check
            ;;
        noon)
            noon_sync
            ;;
        afternoon)
            afternoon_check
            ;;
        wrapup)
            daily_wrap_up
            ;;
        evening)
            evening_checklist
            ;;
        weekend)
            weekend_check
            ;;
        final)
            final_check
            ;;
        all)
            morning_reminder
            echo -e "\n${PURPLE}─────────────────────────────────────────${NC}\n"
            midmorning_check
            echo -e "\n${PURPLE}─────────────────────────────────────────${NC}\n"
            noon_sync
            echo -e "\n${PURPLE}─────────────────────────────────────────${NC}\n"
            afternoon_check
            echo -e "\n${PURPLE}─────────────────────────────────────────${NC}\n"
            daily_wrap_up
            echo -e "\n${PURPLE}─────────────────────────────────────────${NC}\n"
            evening_checklist
            ;;
        *)
            echo -e "${RED}未知的選項: $1${NC}"
            echo ""
            echo "用法: $0 [morning|midmorning|noon|afternoon|wrapup|evening|weekend|final|all]"
            echo ""
            echo "說明:"
            echo "  morning      - 早上 9 點提醒 (站會前)"
            echo "  midmorning   - 上午 11 點檢查 (工作流 B 進度)"
            echo "  noon         - 中午 12 點同步 (進度報告)"
            echo "  afternoon    - 下午 3 點檢查 (工作流 E 進度)"
            echo "  wrapup       - 下午 5 點日終總結"
            echo "  evening      - 晚上 6 點檢查清單"
            echo "  weekend      - 週末前檢查 (11/15)"
            echo "  final        - 最終檢查 (11/17)"
            echo "  all          - 完整一日流程 (所有提醒)"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 執行主程序
main "$@"
