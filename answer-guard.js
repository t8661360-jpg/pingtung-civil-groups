/* 答案把關與回報：
   1. 信心不足就不硬答：內建「流程型」答案（例如「會員大會怎麼開」）被拿來回答「可不可以／最晚何時／誰／幾個」這類
      具體問題時，不直接顯示，改列出「您是不是要問以下相關的問題？」讓民眾點選。
   2. 每則答案下方加「這個答案沒有幫到我」回報按鈕，送進待處理問題（GitHub Issue → Notion 佇列），不含個資。 */
(function () {
  const NFK = s => String(s || '').normalize('NFKC').replace(/\s+/g, '').replace(/臺/g, '台');
  const SPECIFIC = /可以|可不可以|能不能|能否|是否|最晚|最遲|幾月|幾天|幾日|多久|多少|幾個|幾人|幾位|幾次|誰|哪個|哪一個|哪裡|向誰|算不算|有沒有|會不會|要不要|需不需要|一定要|嗎[?？]?$/;
  const HOWTO = /怎麼|如何|怎樣|流程|步驟|程序|手續|要準備|準備什麼|文件|資料|表單|書表/;
  const grams = s => { const t = NFK(s).replace(/[^一-鿿0-9a-z]/gi, ''); const g = new Set(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
  function similar(q, limit) {
    const list = (typeof window.keywordQuestions === 'function' && window.keywordQuestions()) || [];
    const qg = grams(q); if (!qg.size) return [];
    const scored = [];
    for (const c of list) { const cg = grams(c); let n = 0; for (const x of cg) if (qg.has(x)) n++; const s = n / Math.sqrt(cg.size * qg.size || 1); if (n >= 2 && s >= 0.25) scored.push([s, c]); }
    scored.sort((a, b) => b[0] - a[0]);
    const out = [], seen = new Set();
    for (const [, c] of scored) { const h = NFK(c).slice(0, 6); if (seen.has(h)) continue; seen.add(h); out.push(c); if (out.length >= limit) break; }
    return out;
  }
  function guard(q, a) {
    try {
      if (!a || a.direct || a.questionState || a.unanswered || !a.title) return null;
      if ((typeof exactArticleAnswer === 'function' && exactArticleAnswer(q)) || (typeof focusedQuestionAnswer === 'function' && focusedQuestionAnswer(q))) return null; // 會被其他已核對答案取代
      if (typeof KB === 'undefined' || !KB.some(e => e.title === a.title)) return null; // 只把關內建流程型答案
      if (!(a.steps && a.steps.length >= 3)) return null;
      const t = NFK(q);
      if (t.length < 8 || !SPECIFIC.test(t) || HOWTO.test(t)) return null;
      const rel = [a.title, ...similar(q, 6).filter(x => x !== a.title)].slice(0, 7);
      if (rel.length < 2) return null;
      return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
        summary: '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
        related: rel, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true };
    } catch (e) { return null; }
  }
  const ENDPOINT = (document.querySelector('meta[name="unanswered-endpoint"]') || {}).content || '';
  function feedbackBar(q, a) {
    const board = document.getElementById('board'); if (!board || !a || a.unanswered) return;
    if (/您是不是要問|難倒小屏/.test(a.title || '')) return;
    const old = board.querySelector('.fb-bar'); if (old) old.remove();
    const bar = document.createElement('div');
    bar.className = 'fb-bar';
    bar.style.cssText = 'margin-top:18px;padding-top:12px;border-top:1px dashed rgba(128,128,128,.35);font-size:.92em;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
    bar.innerHTML = '<span>這個答案有沒有幫到您？</span><button type="button" class="fb-yes" style="padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer">有幫到</button><button type="button" class="fb-no" style="padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer">沒有幫到我</button>';
    const yes = bar.querySelector('.fb-yes'), no = bar.querySelector('.fb-no');
    const status = document.createElement('span');
    status.setAttribute('role', 'status');
    bar.appendChild(status);
    const done = msg => { bar.textContent = ''; status.textContent = msg; bar.appendChild(status); };
    yes.onclick = () => done('謝謝您的回饋！');
    no.onclick = async () => {
      if (no.disabled) return;
      yes.disabled = no.disabled = true;
      status.textContent = '正在送出回報…';
      const key = 'fb-confirmed';
      let sent = [];
      try {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(cached)) sent = cached;
        } catch (e) {}
        if (!ENDPOINT || typeof scrubPII !== 'function') throw new Error('feedback unavailable');
        const text = ('〔答錯回報〕' + scrubPII(q) + '｜小屏答：' + scrubPII(a.title).slice(0, 60)).slice(0, 300);
        if (sent.includes(text)) {
          done('這則回報已送出，不用重複送。');
          return;
        }
        const res = await fetch(ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, page: location.pathname, at: new Date().toISOString() }), keepalive: true
        });
        if (!res.ok) throw new Error('feedback request failed');
        const ack = await res.json();
        if (ack?.ok !== true || !Number.isInteger(ack.issue) || ack.issue < 1) throw new Error('feedback not acknowledged');
        try { localStorage.setItem(key, JSON.stringify([...sent, text].slice(-100))); } catch (e) {}
        done('謝謝，回報已送出。急件請直接電洽承辦人員。');
      } catch (e) {
        status.textContent = '未能確認回報已送出，請稍後再試。急件請直接電洽承辦人員。';
        yes.disabled = no.disabled = false;
      }
    };
    board.appendChild(bar);
  }
  if (typeof renderAnswer === 'function') {
    const prev = renderAnswer;
    renderAnswer = function (q, a) {
      const g = guard(q, a);
      const out = prev(q, g || a);
      try { feedbackBar(q, g || a); } catch (e) {}
      return out;
    };
  }
})();
