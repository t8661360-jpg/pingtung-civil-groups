// 公開網站自動檢查（由 GitHub Actions 執行）。只使用固定、已核實的測試問句，不收集任何民眾問題或個資。
import { chromium } from 'playwright';
const BASE = (process.env.BASE_URL || 'https://t8661360-jpg.github.io/pingtung-civil-groups/').replace(/\/?$/, '/');
const CHECKS = [
  ['協會理事會多久要開一次', '六個月'],                       // 人民團體法第43條
  ['原定理事9人，當理事剩下7人時，召開理事會至少應有幾人出席才能成會？', '至少要 4 人'], // 人民團體法第29條、會務輔導辦法第16條
  ['合作社成立最少幾個人', '7人'],                            // 合作社法第8條
  ['協會會員可以委託幾個人', '代理一人'],                      // 人民團體法第42條
  ['決算什麼時候要送縣府', '三個月內'],                        // 社會團體財務處理辦法第11條
  ['改選要用的表在哪下載', '改選'],
  ['協會任期可以五年嗎', '最長四年'],                        // 人民團體法第20條（2026-11-11 深層校正）
  ['常務理事有幾名', '三分之一'],                              // 人民團體法第17條
  ['魅力社區補助多少', '40萬'],
  ['社團每年要開些什麼會', '每六個月'],                        // 使用者截圖：不可答成合作社（人民團體法第25、43條）
  ['會長做兩任了還能再選嗎', '連任以一次為限'],                // 口語同義詞：會長＝理事長（第20條）
  ['罷免理事要多少人同意', '三分之二'],                        // 選舉罷免辦法第30、34條
  ['理事辭職要補選嗎', '遞補'],                                // 選舉罷免辦法第17條
  ['解散要多少人同意', '三分之二'],                            // 人民團體法第27條
  ['領錢要蓋誰的章', '財務人員'],                              // 財務處理辦法第17條
  ['我們協會每年有哪些會一定要開', '會員大會'],                // 不可誤判為名冊查詢
  ['顧問要怎麼聘', '理事會'],                                  // 人民團體法第17、54條（2026-11-12）
  ['協會的印章誰保管', '移交'],                                // 人民團體法第10條；會務輔導辦法第18條
  ['協會可以辦旅遊嗎', '不予補助'],                            // 屏東縣政府對民間團體補助經費作業要點第5點
  ['協會辦活動要報備嗎', '不一定'],                            // 人民團體法第26條；會務輔導辦法第12條
  ['協會可以設基金嗎', '20%'],                                 // 社會團體財務處理辦法第15條
  ['監事可以當會計嗎', '不可以'],                              // 社會團體工作人員管理辦法第4條
  ['選舉可以用舉手的嗎', '無記名'],                            // 選舉罷免辦法第4條
  ['合作社要開社員大會嗎', '每年至少一次'],                    // 合作社法第45條
  ['成立協會要多少錢', '資本額'],                              // 人民團體法第8～11條
  ['籌備會要開幾次', '沒有規定次數'],                          // 人民團體法第9條
  ['會員大會人數不夠怎麼辦', '重新召集'],                      // 人民團體法第26、27、42條
  ['一個村可以有兩個社區發展協會嗎', '沒有明文禁止'],          // 社區發展工作要點第4、17點；人民團體法第7條
  ['社區發展協會理事長可以是村長嗎', '沒有禁止'],              // 人民團體法第17、20條
  ['國際性團體任期起算', '照章程'],                            // 選舉罷免辦法第28條但書
  ['理事可以請假幾次', '視同辭職'],                          // 人民團體法第31條
  ['協會要換名字怎麼辦', '三分之二'],                          // 人民團體法第12、27條
  ['開會通知可以用LINE嗎', '通知的方式'],                      // 人民團體法第26條、會務輔導辦法第10條
  ['公會跟協會差在哪', '目的不同'],                            // 人民團體法第35、39條
  ['佳冬的社區要問魅力社區計畫電話是多少', '5314'],            // 使用者確認：陳怡伶 分機5314                                // 知識庫口語改寫後仍可檢索
  ['協會解散後剩下的財產怎麼處理', '不能分給會員'],            // 民法第44條、免稅標準第2條
  ['佳冬鄉文化類團體有幾個', '佳冬鄉'],                        // 名冊資料載入
  ['協會可以不開會嗎', '每年召開一次'],                       // 人民團體法第25條、第43條
  ['協會可以申請屏東縣托嬰中心嗎', '設立許可'],               // 檢索門檻：不得配到無關條目
  ['社工師公會', '社會工作師公會'],                           // 名稱同義詞：社工師＝社會工作師
  ['興心慈善會', '社團法人屏東縣興心慈善會'],                 // 名稱結尾辨識：慈善會
  ['理監事人數不足過半', '補選'],                             // 選罷辦法第17條
  ['總幹事一定是要會員才可以擔任嗎', '不一定'],               // 人民團體法第24條、社會團體工作人員管理辦法
  ['理事可以兼任總幹事嗎', '不得'],                           // 社會團體工作人員管理辦法第4條
  ['協會如果有志工，可以申請志願服務祥和隊嗎', '運用單位'],   // 志願服務法第3、7條
  ['志工服務滿幾年可以申請榮譽卡', '三百小時'],               // 志願服務法第20條
  ['未滿18歲可以加入協會嗎', '章程'],                         // 人民團體法第8、12條
];
const fails = []; const log = m => console.log(m);
const bust = '?check=' + Date.now();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  // 0. 首頁檔案完整性（防止截斷內容被寫入）
  const res = await fetch(BASE + 'index.html' + bust);
  const html = await res.text();
  if (res.status !== 200) fails.push(`index.html HTTP ${res.status}`);
  if (!html.trimStart().startsWith('<!DOCTYPE')) fails.push('index.html 開頭不是 <!DOCTYPE（可能被寫入不完整內容）');
  if (/truncated output|tokens truncated/i.test(html)) fails.push('index.html 含截斷標記');
  for (const f of ['data/directory.json', 'data/forms-catalog.json', 'data/forms-s1.json', 'round-fixes.js', 'counter-upgrade.js', 'question-understanding.js']) {
    const r = await fetch(BASE + f + bust, { method: 'HEAD' });
    if (r.status !== 200) fails.push(`${f} HTTP ${r.status}`);
  }
  // 1. 桌機問答
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE + bust, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4000);
  if (!(await page.isVisible('#v-home'))) fails.push('首頁櫃檯區沒有顯示');
  for (const [q, want] of CHECKS) {
    await page.fill('#q', q); await page.click('#askform button[type=submit]');
    await page.waitForTimeout(1800);
    const text = await page.innerText('#board');
    const title = (await page.$eval('#board .atitle', e => e.innerText).catch(() => '')) || '';
    const ok = text.includes(want);
    log(`${ok ? 'PASS' : 'FAIL'}｜${q}｜${title}`);
    if (!ok) fails.push(`問答：「${q}」未包含「${want}」，實際標題「${title}」`);
  }
  // 2. 書表下載頁
  await page.goto(BASE + '#forms'); await page.waitForTimeout(3000);
  await page.click('#formtabs [data-f="改選"]').catch(() => fails.push('書表下載頁找不到「改選」分類'));
  await page.waitForTimeout(800);
  const n = await page.$$eval('#formlist [data-dl]', a => a.length).catch(() => 0);
  log(`書表「改選」檔案按鈕：${n}`); if (n < 10) fails.push(`書表「改選」分類只有 ${n} 個檔案按鈕`);
  if (errs.length) fails.push('頁面錯誤：' + errs.slice(0, 3).join(' / '));
  // 3. 手機版面
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await m.goto(BASE + bust); await m.waitForTimeout(3000);
  const over = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  log(`手機水平捲動：${over}`); if (over) fails.push('手機 390px 出現水平捲動');
} catch (e) { fails.push('檢查程式錯誤：' + e.message); }
await browser.close();
if (fails.length) { console.error('\n檢查失敗：\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('\n全部檢查通過');
