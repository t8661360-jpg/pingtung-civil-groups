# 數位櫃檯內建 AI 模組 可行性評估 (2026-11-10)

## 現況
index.html 已有 `aiAnswer(q,kb)`：以 search_groups / search_staff / search_knowledge 三個工具檢索後，
由模型產生 JSON 答案，並禁止編造條號、文號、人名、電話。
啟動條件是 `window.claude.use('sample')`，僅在 Claude artifact 環境存在；GitHub Pages 上 caps.sample 為 null，
**此模組從未對民眾啟用**。

## 可行且建議
| 項目 | 作法 | 成本／前提 |
|---|---|---|
| 有依據的 AI 回答 | 檢索法條+知識庫 → 模型只依檢索內容作答並附來源；無來源即導向承辦人 | 需小型後端保管 API 金鑰（Cloudflare Worker 免費額度可行）；每題計費 |
| 查最新法規 | 模型可用 web search，但網域白名單：law.moj.gov.tw、pthg.gov.tw、moi.gov.tw | 查得內容進「待覆核」，不直接回答 |
| 法規異動監測 | GitHub Actions 每週抓 statutes.json.gz 內各法規原文比對，有差異自動開 Issue | 不需 AI，最可靠 |
| AI 擬稿擴充知識庫 | 反饋系統收到的未答好問題 → AI 擬草稿附法條 → **承辦人核准（PR merge）**後進知識庫 | 人工審核是必要條件 |

## 不建議
- **AI 自行修改網頁程式／知識庫、無人簽核**：2026-11-10 當天即發生 AI 寫入與人團法§20 相反的連任規定及錯誤法規代碼（見 STATUTE-VERIFICATION-2026-11-10.md）。代表縣府的法律資訊，任何寫入都要人工核准。
- **「自我升級模組」**：模型由供應商升級；可做的是定期切換模型版本並用 eval-questions.cjs 驗證不退步。
- 個資：民眾問題送雲端模型前須遮罩姓名、電話、身分證字號，並於頁面告知。

## 分期
1. ✅ 仲裁層 + 法條核對過的規則與知識庫（零成本）
2. 後端代理 + 啟用 aiAnswer（有依據回答，記錄每題來源）
3. 法規監測 Action（每週）
4. AI 擬稿 → 承辦人核准 → 知識庫

## 第二期最小後端規格（Cloudflare Worker）
- POST /ask {q, kbHits[], statuteHits[]} → 轉呼叫模型 API，system prompt 沿用 aiAnswer 的規則
- 只回 JSON；server 端驗證 laws[] 代碼存在於 statutes.json.gz，否則剔除
- 記錄 {q(遮罩後), 來源, 模型, 時間} 供覆核；不記錄 IP
- 前端：caps.sample 為 null 時改用 fetch('/ask')，其餘流程不變
