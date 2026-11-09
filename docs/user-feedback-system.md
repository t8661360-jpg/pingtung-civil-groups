# 用戶反饋系統規劃

## 1. 前端反饋收集
位置: index.html 頁面底部 (隱藏按鈕或側邊欄)

### 反饋類型
- **誤答**: 答案錯誤或不相關
- **漏洞**: 應該回答但沒有
- **表述**: 用詞不清或易誤解
- **建議**: 改進方向

### 數據欄位
```javascript
{
  "type": "誤答|漏洞|表述|建議",
  "question": "使用者提問",
  "answer_title": "獲得的答案標題",
  "issue": "反饋內容",
  "timestamp": "2026-11-09T...",
  "user_session": "匿名 session id"
}
```

### 存儲方式
- GitHub Issues (自動開立)
- CSV 日誌 (備份)
- 實時面板 (管理後台)

## 2. 反饋收集表單設計
```html
<div id="feedback-panel" class="hidden">
 <form id="feedback-form">
  <select name="type" required>
   <option>選反饋類型</option>
   <option value="error">這個答案有錯</option>
   <option value="missing">應該回答這個問題</option>
   <option value="clarity">用詞不夠清楚</option>
   <option value="suggestion">改進建議</option>
  </select>
  <textarea name="issue" placeholder="具體描述..." required></textarea>
  <button type="submit">送出反饋</button>
  <small>完全匿名，不收集個人資訊</small>
 </form>
</div>
```

## 3. 反饋工作流
1. 使用者送出 → 存至 localStorage + GitHub API
2. GitHub 自動開 issue (標籤: feedback, 優先級)
3. 開發者每週檢查反饋
4. 修正後標記解決、關閉 issue
5. 統計反饋趨勢 (每月報告)

## 4. 優先级判定
- **高優先**: 多人反饋同一誤答
- **中優先**: 邊界情況缺失
- **低優先**: 表述改進、UI 建議

## 5. 反饋統計儀表板
```markdown
| 類型 | 本週 | 已解決 | 待處理 |
|------|------|--------|--------|
| 誤答 | 3    | 2      | 1      |
| 漏洞 | 5    | 1      | 4      |
| 表述 | 2    | 0      | 2      |
| 建議 | 8    | 0      | 8      |
```

## 6. 集成到 GitHub Actions
- 每日統計反饋數量
- 自動生成週報
- 觸發優先規則修正 (高於5人反饋)

