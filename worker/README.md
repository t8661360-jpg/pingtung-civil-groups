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
