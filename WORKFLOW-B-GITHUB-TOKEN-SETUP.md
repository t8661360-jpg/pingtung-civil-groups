# 🔧 工作流 B: GitHub Token 配置 (完整技術指南)

**工作流**: B. 技術配置 (Infrastructure Setup)  
**負責人**: DevOps / 技術主管  
**優先級**: P0 CRITICAL PATH  
**時間**: 11/11 09:30-11:30 (2 小時)  
**狀態**: 準備執行

---

## 🎯 核心目標

在 11/11 上午完成以下 3 項關鍵任務：

1. ✅ GitHub Personal Access Token 生成
2. ✅ Repository Secrets 配置
3. ✅ 工作流驗證測試

---

## 📋 詳細執行步驟

### 第一部分：生成 GitHub Personal Access Token (30 分鐘)

#### 步驟 1: 登錄 GitHub
```
1. 打開 https://github.com
2. 登錄帳號: t8661360-jpg
3. 確保登錄成功
```

#### 步驟 2: 進入 Developer Settings
```
導航路徑:
  點擊右上角個人頭像
    ↓
  Settings
    ↓
  Developer settings (左側邊欄底部)
    ↓
  Personal access tokens
    ↓
  Tokens (classic)
```

#### 步驟 3: 生成新 Token
```
點擊 "Generate new token (classic)"

填寫以下信息:
┌─────────────────────────────────────────┐
│ Token 設置表單                           │
├─────────────────────────────────────────┤
│ Note (Token 名稱):                      │
│ "pingtung-civic-counter-2026-11"       │
│                                         │
│ Expiration (過期時間):                   │
│ 90 days                                 │
│ (確保 11/20 前有效)                      │
│                                         │
│ Select scopes (勾選權限):                 │
│ ☑ repo (Full control of private repos) │
│ ☑ workflow                              │
│ ☑ write:packages                        │
│                                         │
│ 其他選項保持默認                         │
└─────────────────────────────────────────┘

⚠️ IMPORTANT:
  - 勾選 "repo" 會包含所有細項
  - 確保至少有:
    ├─ repo:status
    ├─ repo_deployment
    ├─ public_repo
    └─ repo:invite
  - workflow 用於 GitHub Actions
  - write:packages 用於發佈
```

#### 步驟 4: 複製 Token
```
點擊 "Generate token"
  ↓
頁面顯示生成的 Token (長串字符)
  ↓
⚠️ 立即複製 (只顯示一次!)
  ↓
保存到安全地方 (密碼管理器或臨時記事本)

Token 格式:
  ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  (以 ghp_ 開頭，約 40 個字符)
```

#### 步驟 5: 驗證 Token 有效性
```
打開命令行，測試 Token:

$ curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user

預期輸出:
{
  "login": "t8661360-jpg",
  "id": XXXXX,
  ...
}

✅ 如果顯示用戶信息，Token 有效
❌ 如果報錯，Token 可能無效
```

---

### 第二部分：設置 Repository Secrets (30 分鐘)

#### 步驟 1: 進入 Repository Settings
```
導航到 GitHub Repository:
  https://github.com/t8661360-jpg/pingtung-civil-groups

點擊 "Settings" 標籤
  ↓
在左側邊欄找到 "Secrets and variables"
  ↓
點擊 "Actions"
```

#### 步驟 2: 創建新 Secret
```
點擊 "New repository secret"

填寫信息:
┌──────────────────────────────────┐
│ Secret 表單                       │
├──────────────────────────────────┤
│ Name:                            │
│ GITHUB_TOKEN                     │
│                                  │
│ Secret (粘貼 Token):             │
│ ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXX │
│                                  │
│ 點擊 "Add secret"               │
└──────────────────────────────────┘
```

#### 步驟 3: 確認設置
```
✅ GITHUB_TOKEN 應該出現在列表中

如果需要修改:
  點擊 Secret 名稱
    ↓
  點擊 "Update"
    ↓
  修改值
    ↓
  保存

⚠️ 注意: Secret 一旦保存無法再查看
   只能更新或刪除
```

---

### 第三部分：驗證 GitHub Actions 工作流 (1 小時)

#### 步驟 1: 檢查現有工作流
```
導航:
  Repository 首頁
    ↓
  "Actions" 標籤
    ↓
  查看 Workflows

應該看到:
  ✅ feedback-sync.yml
  ✅ site-check.yml

查看最新運行:
  點擊工作流名稱
    ↓
  查看最新 run
    ↓
  檢查執行結果
```

#### 步驟 2: 手動觸發工作流測試
```
在 "Actions" 標籤中:

找到 "feedback-sync" workflow
  ↓
點擊 "Run workflow"
  ↓
選擇 Branch: main
  ↓
點擊 "Run workflow"
  ↓
等待執行 (通常 1-5 分鐘)

檢查執行結果:
  點擊最新的 run
    ↓
  查看 "feedback-sync" job
    ↓
  查看日誌輸出
```

#### 步驟 3: 檢查工作流內容
```
打開 .github/workflows/feedback-sync.yml

檢查清單:
☑ env.GITHUB_TOKEN 已正確使用
☑ 排程設置: 0 3 * * * (每日 03:00 UTC)
☑ 工作流使用了 GITHUB_TOKEN

如果需要修改工作流:
  1. 打開文件
  2. 編輯內容
  3. 提交到 GitHub
  4. 工作流自動更新
```

#### 步驟 4: API 權限測試
```
在工作流運行中驗證:

期望的 API 調用:
  ✅ GET /repos/{owner}/{repo}/issues
  ✅ POST /repos/{owner}/{repo}/issues
  ✅ PATCH /repos/{owner}/{repo}/issues/{issue_number}

檢查日誌中是否有:
  ✅ "Issue opened successfully"
  ✅ "Label added"
  ✅ "Priority assigned"

如果出錯:
  ❌ "403 Forbidden" → Token 權限不足
  ❌ "401 Unauthorized" → Token 無效
  ❌ "404 Not Found" → Repository 名稱錯誤
```

---

## 🧪 測試清單

### 基本驗證
```
□ Token 已生成並複製
□ Token 格式正確 (ghp_XXXX)
□ Token 過期時間 > 11/20
□ Secret GITHUB_TOKEN 已配置
□ Repository Secrets 中可見 GITHUB_TOKEN
```

### 工作流驗證
```
□ feedback-sync.yml 可訪問
□ 手動觸發成功執行
□ 工作流日誌無錯誤
□ 如果有 Issue 反饻，能自動開立 Issue
□ Issue 標籤正確 (feedback, type-*, priority-*)
```

### 權限驗證
```
□ Token 有 repo 權限
□ Token 有 workflow 權限
□ 可以讀取 Issues
□ 可以創建 Issues
□ 可以編輯 Issues
□ 可以添加標籤
```

### 端到端測試
```
□ 手動提交一個測試反饻
□ 等待 GitHub Actions 執行
□ 驗證 Issue 自動開立
□ 檢查 Issue 詳情:
  ├─ 標題正確
  ├─ 描述完整
  ├─ 標籤正確
  └─ 優先級正確
```

---

## 📊 常見問題排查

### Q: Token 無效 (401 Unauthorized)
```
排查步驟:
1. 確認 Token 已複製完整 (無多餘空格)
2. 確認 Secret 名稱是 "GITHUB_TOKEN"
3. 重新生成新 Token
   (舊 Token 可能已過期或被撤銷)
4. 重新配置 Secret
```

### Q: 權限不足 (403 Forbidden)
```
排查步驟:
1. 確認勾選了 "repo" 權限
2. 確認勾選了 "workflow" 權限
3. 確認賬號是 Repository owner 或 collaborator
4. 如果是 Organization repo，檢查 org 權限
```

### Q: 工作流找不到 GITHUB_TOKEN
```
排查步驟:
1. 檢查 .github/workflows/ 文件是否存在
2. 確認工作流文件中使用了正確的 Secret 名稱
3. 確認工作流文件 syntax 正確 (YAML 格式)
4. 推送到 main 分支後重試
```

### Q: Issue 無法自動開立
```
排查步驟:
1. 檢查工作流日誌中的錯誤信息
2. 驗證 API 調用語法是否正確
3. 確認 Issue 數據格式有效
4. 檢查是否超過 GitHub API 速率限制
5. 查看 Repository 設置是否禁用了 Issues
```

---

## 🎯 成功標準

工作流 B 完成的標準:

✅ **GitHub Token 配置**
  - Token 已生成並存儲在 Secret 中
  - Token 有效性已驗證
  - 過期時間 > 11/20

✅ **Repository Secrets 設置**
  - GITHUB_TOKEN 已正確配置
  - Secret 在工作流中可訪問
  - 沒有権限錯誤

✅ **工作流驗證**
  - feedback-sync.yml 成功運行
  - 手動觸發測試通過
  - 日誌無錯誤信息
  - API 調用正常

✅ **端到端測試**
  - Issue 能自動開立
  - 標籤和優先級正確設置
  - 整個流程順利運行

---

## 📝 執行檢查清單

### 11/11 09:30 開始
```
□ 準備工作
  □ 打開本指南
  □ 準備好密碼管理器或記事本
  □ 確保網絡連接正常
  □ 有充足時間 (2 小時)

□ 生成 Token (09:30-10:00)
  □ 登錄 GitHub
  □ 進入 Developer Settings
  □ 生成新 Token
  □ 複製並保存 Token
  □ 驗證 Token 有效性

□ 配置 Secrets (10:00-10:30)
  □ 進入 Repository Settings
  □ 創建新 Secret
  □ 名稱: GITHUB_TOKEN
  □ 值: 粘貼 Token
  □ 確認保存

□ 驗證工作流 (10:30-11:30)
  □ 查看現有工作流
  □ 手動觸發 feedback-sync
  □ 檢查執行結果
  □ 驗證 API 權限
  □ 執行端到端測試
```

### 完成時檢查
```
□ 所有步驟完成
□ 沒有錯誤信息
□ 工作流正常運行
□ 測試通過
□ 記錄 Token ID (用於追蹤)
□ 更新 EXECUTION-TRACKER.md
```

---

## 🚨 應急預案

如果 Token 配置出錯:

```
情況 1: Token 無效
  → 重新生成新 Token
  → 更新 Secret
  → 重新測試

情況 2: 權限不足
  → 檢查 Token scopes
  → 重新生成並勾選所有權限
  → 或聯繫 Repository owner

情況 3: 工作流無法訪問 Secret
  → 檢查 Secret 名稱是否完全匹配
  → 確認 Secret 已保存
  → 推送新 commit 後重試

情況 4: API 調用失敗
  → 檢查 GitHub API 狀態
  → 驗證 API 調用語法
  → 檢查是否超過速率限制
```

---

## 📞 聯繫和支援

如果遇到問題:

1. **檢查本指南** - 常見問題排查段落
2. **查看工作流日誌** - GitHub Actions 日誌通常有詳細錯誤信息
3. **檢查 GitHub 狀態** - https://www.githubstatus.com
4. **聯繫 PM** - 如果 30 分鐘內無法解決

---

**版本**: 1.0  
**最後更新**: 2026-11-10  
**狀態**: 準備執行  
**預計完成時間**: 11/11 11:30

