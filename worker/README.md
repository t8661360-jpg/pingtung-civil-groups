# 無法回答問題 → GitHub Issue 中繼（部署一次，約 10 分鐘）

GitHub Pages 是靜態網頁，不能放 GitHub 權杖，所以民眾的問題要經過這支 Worker 代為開 Issue。免費額度（每日 10 萬次）綽綽有餘。

## 1. 建 GitHub 權杖
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
- Repository access：Only select repositories → `pingtung-civil-groups`
- Permissions → Repository permissions → **Issues: Read and write**（其他都不要）
- 複製權杖（只會顯示一次）

## 2. 建 Worker
1. https://dash.cloudflare.com → Workers & Pages → Create → Create Worker → 取名 `pingtung-unanswered` → Deploy
2. 點 Edit code，把 `worker/unanswered-relay.js` 內容全部貼上 → Deploy
3. Settings → Variables and Secrets：
   - `GITHUB_TOKEN`（type: Secret）＝ 步驟 1 的權杖
   - `REPO` ＝ `t8661360-jpg/pingtung-civil-groups`
4. （選用）Settings → Bindings → KV Namespace，變數名 `RATE`，用來限流；不設也能跑。
5. 記下 Worker 網址，形如 `https://pingtung-unanswered.<你的帳號>.workers.dev`

## 3. 接到網頁
`index.html` 第 5 行左右：
```html
<meta name="unanswered-endpoint" content="https://pingtung-unanswered.<你的帳號>.workers.dev">
```
填入網址後提交推送即可。留空＝不上傳，只存在民眾手機。

## 4. 驗證
手機問一題胡亂的問題（例如「小屏你幾歲」），幾秒後 GitHub Issues 應出現 `[無法回答] …`，標籤「反饋」「無法回答」。
每週一至五 08:47 的「每日校正巡檢」排程會讀這些 Issue、查法條、開 PR 補答案。

## 隱私
- 前端送出前已把電話、身分證字號、email 遮罩為 [電話]／[身分證]／[email]。
- Worker 只接受來自 `https://t8661360-jpg.github.io` 的請求。
- 不記錄 IP 到 Issue；KV 限流只存一分鐘。
- 建議在網頁頁尾加一句：「您的提問可能用於改善本站回答品質，請勿輸入個人資料。」

## 內部 AI 草稿（不對民眾開放）
Worker 新增 `POST /draft`，依提供的法條原文產生草稿答案，目前只供內部呼叫，前端尚未接上。

設定（Cloudflare → pingtung-unanswered → Settings）：
- Bindings：新增 **Workers AI**，變數名 `AI`（已設定）
- Variables：`PROVIDER`＝`cloudflare`、`CF_MODEL`＝`@cf/meta/llama-3.3-70b-instruct-fp8-fast`（已設定；模型名稱請以 Cloudflare 目前目錄為準）
- Secrets（請自行設定，勿貼到聊天）：
  - `DRAFT_KEY`：自行產生一組隨機字串，用來保護 `/draft`
  - `GROQ_API_KEY`（選用）：若要改用 Groq，設定後把 `PROVIDER` 改為 `groq`，並可設定 `GROQ_MODEL`

測試（在自己的電腦上執行，把 KEY 換成您設定的值）：
```
curl -s -X POST https://pingtung-unanswered.t8661360.workers.dev/draft \
  -H "Content-Type: application/json" -H "X-Draft-Key: KEY" \
  -d '{"q":"理事長可以自己決定換總幹事嗎","statutes":[{"title":"人民團體法§24","text":"人民團體依其章程聘僱工作人員，辦理會務、業務。"}]}'
```
回傳 `{"ok":true,"answer":...}` 即為成功。沒有正確金鑰會回 403。

## 公開 AI 即時回覆（POST /ask）
櫃檯規則和知識庫都答不出來時，網頁會自動呼叫 `/ask`：Worker 從網站的法規資料（`data/statutes.json.gz`，公開）檢索相關條文，只用這些條文請模型整理成口語回答；程式會核對回答引用的條號都在檢索結果內、句意與條文有重疊，沒有電話或網址，核對不過就不回覆（網頁維持「難倒小屏」）。稅務相關問題不交給 AI。

- 網頁顯示時固定標示「AI 整理（僅供參考）」，並列出引用的法條原文。
- 同時把 AI 回覆當草稿留言到對應的「[無法回答]」Issue，**不會直接進知識庫**，由承辦人員審核後才補進。
- 啟用順序：① 先貼上新版 Worker 並 Deploy；② 再把 `index.html` 的 `<meta name="ai-endpoint" content="">` 填入 Worker 網址（例如 `https://pingtung-unanswered.t8661360.workers.dev`）。順序不能反，舊版 Worker 沒有 `/ask`，會把呼叫當成一般無法回答回報。
- 部署：把 `worker/unanswered-relay.js` 全部貼上 Worker 覆蓋並 Deploy。不需要新增任何密鑰；沿用既有的 `AI` 綁定、`GITHUB_TOKEN`、`REPO`、`RATE`（建議一定要綁 KV `RATE`，`/ask` 每 IP 每分鐘限 3 次）。
- 想換模型：改 `CF_MODEL`（或 `PROVIDER=groq`）。換模型前，請先用題庫實測中文法規的準確度。
- 提醒：民眾的問題會送到 Cloudflare Workers AI 處理，請依縣府規定確認；並留意 Workers AI 的用量額度。
- 緊急關閉：把 `index.html` 的 `ai-endpoint` 留空，網頁就不會呼叫 `/ask`。

## AI 理解問題（POST /understand，使用 Claude API）
小屏答不出來（難倒小屏）或不確定有沒有聽懂（把關選單）時，網頁會呼叫 `/understand`：Worker 把民眾的問題和已核對的題庫（`data/keyword-questions.json`，公開）交給 Claude，請它判斷「這句話最接近題庫裡的哪幾題」，網頁再把那幾題列成按鈕讓民眾點選。

- **AI 只挑題目，不產生答案。** Worker 會逐一核對模型回的編號，不在題庫內的一律丟棄；網頁端再核對一次。民眾點下去看到的是題庫原本已核對的答案。
- 題庫沒有相同意思的題目時回空清單，網頁維持原本的「難倒小屏」，問題照舊進待處理佇列（GitHub Issue）。
- 任何失敗（金鑰沒設、逾時、API 錯誤、超過每日上限）都回空清單，網頁不受影響。

啟用順序（順序不能反，舊版 Worker 沒有 `/understand`，會把呼叫當成無法回答回報）：
1. Claude Console（platform.claude.com）→ API Keys → 建一把專用金鑰（建議另開一個 Workspace 並設每月花費上限）。
2. Cloudflare → `pingtung-unanswered` → Settings → Variables and Secrets → 新增 **Secret** `ANTHROPIC_API_KEY`＝該金鑰（請自行貼上，勿貼到聊天或提交到倉庫）。
3. Edit code → 把 `worker/unanswered-relay.js` 全部貼上覆蓋 → Deploy。
4. 把 `index.html` 的 `<meta name="ai-understand-endpoint" content="">` 填入 Worker 網址（`https://pingtung-unanswered.t8661360.workers.dev`）後提交推送。

選用變數：
- `CLAUDE_MODEL`：預設 `claude-haiku-5-5`。
- `UNDERSTAND_DAILY`：每日呼叫上限，預設 300（需綁 KV `RATE` 才會生效；同一 IP 每分鐘限 5 次）。
- `UNDERSTAND_TOPK`：省費用模式。預設把整份題庫（約 2,500 題）交給模型並使用提示快取，理解最準但每次送出的文字較多；設成例如 `150` 時，只送字面最相近的前 150 題，費用低很多，但說法和題庫差很遠的問題可能挑不到。

測試：`node test-ai-understand.cjs`（不會真的呼叫 Claude API）。

提醒：民眾的問題（已遮罩電話、身分證字號、email）會送到 Anthropic 的 Claude API 處理，請依縣府規定確認。
緊急關閉：把 `ai-understand-endpoint` 留空，或刪除 `ANTHROPIC_API_KEY`。
