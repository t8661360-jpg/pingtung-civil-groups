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
    const min = arguments[2] || 0.25;
    for (const c of list) { const cg = grams(c); let n = 0; for (const x of cg) if (qg.has(x)) n++; const s = n / Math.sqrt(cg.size * qg.size || 1); if (n >= 2 && s >= min) scored.push([s, c]); }
    scored.sort((a, b) => b[0] - a[0]);
    const out = [], seen = new Set();
    for (const [, c] of scored) { const h = NFK(c).slice(0, 6); if (seen.has(h)) continue; seen.add(h); out.push(c); if (out.length >= limit) break; }
    return out;
  }
  /* ── 理解強化第1輪 ──────────────────────────────────────────────
     A. 兩種團體互相比較（「社區發展協會跟公會的出席門檻一樣嗎」）：答案沒有同時談到兩種團體，就不硬答，改出選單。
     B. 一句話問兩件事（「理事長一任幾年，還有最多可以連任幾次」）：把兩個小問題分開，各自用已核對的答案回答，
        合在一起顯示；只答得出一半時，明講另一半沒有把握。
     C. 前半是自我介紹、後半才是問題（「我是新上任的總幹事…請問預算什麼時候送」）：答案如果是被自我介紹帶走的，改答後半的問題。
     只重組既有的已核對答案，不新增任何內容。 */
  const TYPES = [['合作社', /合作社/], ['社區發展協會', /社區發展協會|社區協會/], ['公會', /公會|商業會|工業會|職業團體/], ['工會', /工會/], ['基金會', /基金會|財團法人/], ['協會', /協會|社會團體|社團(?!法人)/]];
  const typesOf = t => { let x = NFK(t); const out = []; for (const [n, re] of TYPES) { if (re.test(x)) { out.push(n); x = x.replace(new RegExp(re.source, 'g'), '＿'); } } return out; };
  const COMPARE = /一樣嗎|一不一樣|一樣不一樣|有沒有一樣|相同嗎|是否相同|有什麼不同|有何不同|有什麼不一樣|哪裡不同|哪裡不一樣|差別|差在哪|差異|有什麼差|怎麼分|(跟|和|與).{2,14}(一樣|相同)|比較/;
  const ASK = /[?？]|嗎|呢$|怎麼|如何|怎樣|可以|可不可以|能不能|能否|是否|幾|多久|多少|誰|哪|什麼|甚麼|啥|要不要|需不需要|有沒有|會不會|算不算|一定要/;
  const fixedUnknown = q => { try { if (typeof reportUnanswered === 'function') reportUnanswered(q); } catch (e) {}
    return { category: '其他', title: '抱歉，這個問題難倒小屏了', summary: '抱歉，這個問題難倒小屏了，小屏暫時無法回答喔！建議您先電洽承辦人員詢問～縣府總機 08-7320415 轉社會處承辦人', notes: [], actions: [{ label: '聯絡承辦', view: 'contact', sub: '' }, { label: '回到常見問題', view: 'home', sub: '' }], unanswered: true, guarded: true }; };
  const menu = (q, first) => { const rel = [...(first ? [first] : []), ...similar(q, 6).filter(x => x !== first)].slice(0, 7);
    if (!rel.length) return fixedUnknown(q);
    return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
      summary: '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
      related: rel, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true }; };
  const textOf = a => NFK([a.title, a.summary, (a.notes || []).join(''), (a.steps || []).map(x => Array.isArray(x) ? x.join('') : x).join('')].join('｜'));
  function compareGuard(q, a) {
    if (!a || a.unanswered || a.guarded || /您是不是要問|想先確認|分開看|分別/.test(a.title || '')) return null;
    const t = NFK(q); if (!COMPARE.test(t)) return null;
    const ty = typesOf(t); if (ty.length < 2) return null;
    const at = textOf(a);
    if (ty.every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at))) return null; // 答案兩種團體都有談到
    return menu(q, null);
  }
  function compareTopic(q, a) {
    if (!a || a.unanswered || a.guarded || !window.AnswerArbiter || /您是不是要問|想先確認/.test(a.title || '')) return null;
    const t = NFK(q); if (!COMPARE.test(t)) return null;
    const ty = typesOf(t); if (ty.length < 2) return null;
    const SKIP = /^(協會|合作社|社區發展協會|理事|監事|會員|社員|理事會|監事會|會員大會|社員大會|理事長|會員代表|名額|法人|成立)$/;
    const tp = window.AnswerArbiter.topicsOf(t).filter(x => !SKIP.test(x)); if (!tp.length) return null;
    const has = x => { const at = new Set(window.AnswerArbiter.topicsOf(textOf(x))); return tp.every(k => at.has(k)); };
    if (has(a)) return null;
    try { const f = typeof focusedQuestionAnswer === 'function' ? focusedQuestionAnswer(typeof normalizeQuestion === 'function' ? normalizeQuestion(q) : q) : null;
      if (f && f.questionState && f.questionState.domain === 'mixed' && has(f)) return { ...f, direct: true, guarded: true }; } catch (e) {}
    return menu(q, null);
  }
  const PART_RULES = ['socialRegionalNameAnswer', 'socialNameRestrictionAnswer', 'coopAnnualReportsAnswer', 'communityAnnualPlanAnswer', 'coopSurplusDistributionAnswer', 'socialBoardProxyAnswer', 'socialDissolutionVoteAnswer', 'coopDissolutionVoteAnswer', 'socialMemberExpulsionVoteAnswer', 'coopMemberExpulsionAnswer', 'socialMembershipFeeRefundAnswer', 'coopVoluntaryWithdrawalAnswer', 'socialBoardQuorumAnswer', 'socialQuorumAnswer', 'proxyRatioAnswer', 'socialProxyAnswer', 'coopProxyAnswer', 'accountingBasisAnswer', 'boardSeatAnswer', 'taxRegistrationAnswer'];
  function resolvePart(p) {
    try {
      const nq = typeof normalizeQuestion === 'function' ? normalizeQuestion(p) : p;
      let r = typeof verifiedRoundAnswer === 'function' ? verifiedRoundAnswer(nq, { catalog: (typeof STORE !== 'undefined' && STORE.forms && STORE.forms.catalog) || undefined }) : null;
      if (!r || typeof r !== 'object' || !r.title) { r = null; for (const f of PART_RULES) { try { const fn = eval('typeof ' + f + "==='function'?" + f + ':null'); const v = fn && fn(nq); if (v && v.title) { r = v; break; } } catch (e) {} } }
      if (!r || typeof r !== 'object' || !r.title) r = typeof focusedQuestionAnswer === 'function' ? focusedQuestionAnswer(nq) : null;
      if (!r || !r.title || !r.summary || r.unanswered || /您是不是要問|想先確認|難倒小屏|請選擇|不是這個櫃檯/.test(r.title)) return null;
      if (r.questionState && /clarify|menu/.test(r.questionState.focus || '')) return null;
      if (window.AnswerArbiter) { const sc = window.AnswerArbiter.score(nq, r, null); if (!(sc.s >= 0.6)) return null; }
      return r;
    } catch (e) { return null; }
  }
  const headOf = p => { const m = p.match(/^(.{2,14}?)(?:的話|怎麼|如何|怎樣|可以|可不可以|能不能|能否|是否|要不要|需不需要|有沒有|會不會|幾|多久|多少|誰|哪|什麼|嗎)/); return m ? m[1].replace(/[要是的]$/, '') : ''; };
  function splitAsk(q) {
    const raw = String(q || '').normalize('NFKC').trim();
    if (raw.length < 12 || raw.length > 90) return null;
    const chunks = raw.split(/[?？。；;！!,，]+|另外|還想問|還有(?=.{4})|順便問|再請問|以及(?=.{6})/).map(x => x.trim().replace(/^(那|那麼|請問|想請問|想問|然後|而且|又|再來|也想知道|想知道)/, '')).filter(x => x.length >= 2);
    const parts = []; let bg = '';
    for (const c of chunks) { if (ASK.test(c) && c.length >= 4) { parts.push({ bg, ask: c }); bg = ''; } else bg += c; }
    if (bg && parts.length) parts[parts.length - 1].tail = bg;
    return parts;
  }
  function compound(q, a) {
    if (!a || a.guarded || (a.questionState && /clarify|menu|compound/.test(a.questionState.focus || ''))) return null;
    if (/您是不是要問|想先確認|分開看|分別|兩件事|不是這個櫃檯/.test((a.title || '') + (a.summary || '').slice(0, 30))) return null;
    if (typeof verifiedRoundAnswer !== 'function') return null;
    const parts = splitAsk(q); if (!parts) return null;
    const whole = NFK(q);
    const gt = typesOf(whole);
    const withType = (p, ref) => { if (typesOf(p).length) return p; const rt = typesOf(ref || ''); const g = rt.length === 1 ? rt[0] : (gt.length === 1 ? gt[0] : ''); return g ? g + p : p; };
    /* C. 自我介紹＋問題 */
    if (parts.length === 1 && parts[0].bg && !parts[0].tail) {
      const bg = parts[0].bg, ask = parts[0].ask;
      if (!/^(我是|我們是|我剛|我才剛|本人是|我在|我目前|我今年|我現在是)/.test(bg) || /如果|假如|要是|萬一|但是|可是|不過|結果/.test(bg) || ask.length < 8 || a.unanswered) return null;
      const B = resolvePart(withType(ask, bg)); if (!B || B.title === a.title) return null;
      const hit = (title, text) => { const tt = NFK(title); let n = 0; for (const g of grams(text)) if (tt.includes(g)) n++; return n; };
      if (!(hit(a.title, bg) >= 2 && hit(B.title, ask) > hit(a.title, ask))) return null; // 原答案不是被自我介紹帶走的，就不動
      return { ...B, direct: true, guarded: true };
    }
    /* B. 一句話問兩件事 */
    if (parts.length !== 2) return null;
    const p1 = (parts[0].bg || '') + parts[0].ask; let p2 = (parts[1].bg || '') + parts[1].ask + (parts[1].tail || '');
    if (p1.length < 5 || p2.length < 5) return null;
    if (/呢$/.test(p2) && p2.length < 12) { const k = p1.search(/怎麼|如何|可以|可不可以|能不能|幾|多久|多少|誰|要不要|需不需要|有沒有|會不會/); const subj = p2.replace(/呢$/, ''); if (k < 2 || subj.length < 2) return null; p2 = subj + p1.slice(k); }
    if (/^.{0,8}(也|一樣|同樣)/.test(p2) && p2.length < 14) return null; // 「監事會也可以嗎」這種承接問法，照原本整句回答
    if (/^(如果|假如|要是|萬一)/.test(p1) && !/嗎|呢/.test(parts[0].ask)) return null; // 條件句照原本整句回答
    const A = resolvePart(withType(p1));
    /* 後半句常省略主詞：依序試「代名詞換成前半的職稱」「補上前半的職稱」「原句」「補上前半的開頭」，第一個答得出來的為準 */
    const ROLE = /理事長|常務理事|常務監事|理事|監事|總幹事|會員代表|會員|社員|理事會|監事會|大會/;
    const role = (p1.match(ROLE) || [''])[0], h = headOf(p1);
    const tries = [/^[他她它]/.test(p2) && role ? withType(role, p1) + p2.slice(1) : '', !/^[他她它]/.test(p2) && role && !ROLE.test(p2) ? withType(role + p2, p1) : '', /^[他她它]/.test(p2) ? '' : withType(p2, p1), h && !/^[他她它]/.test(p2) ? h + p2 : ''];
    let B = null; for (const c2 of tries) { if (!c2) continue; B = resolvePart(c2); if (B) { p2 = c2; break; } }
    const tA = A && A.title, tB = B && B.title, W = a.title;
    const covRate = (ans, other) => { const wt = textOf(ans); const tg = [...grams(String(other.title).split(/[:：]/)[0])]; return tg.length ? tg.filter(g => wt.includes(g)).length / tg.length : 0; };
    const covers = (ans, other) => { const wt = textOf(ans); const cov = covRate(ans, other);
      return cov >= 0.75; };
    /* 原答案有沒有談到「另一半問句」本身：去掉問法用字後的字詞八成以上出現在答案裡；問幾年／幾天／幾人的，答案還要有對應單位的數字 */
    const STOPW = /可不可以|可以|能不能|能否|是否|怎麼辦|怎麼|如何|怎樣|什麼|甚麼|要不要|需不需要|有沒有|會不會|還要|還有|還是|的話|或是|或者|以及|另外|請問|幾|多少|多久|嗎|呢|或|和|跟|與|的|了|要|是|又|也|他|她/;
    const coversQ = (ans, part) => { const wt = textOf(ans); const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOPW.source, 'g')).filter(x => x && x.length >= 2);
      const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); if (!g.length) return true;
      if (g.filter(x => wt.includes(x)).length / g.length < 0.75) return false;
      const m = NFK(part).match(/幾(年|個月|天|日|人|位|名|次|屆|張|成|歲)|多少(人|錢|元)|(多久)/); if (!m) return true;
      const u = m[3] ? '(?:年|個月|日|天)' : ({ 天: '(?:天|日)', 日: '(?:天|日)', 位: '(?:人|位|名)', 名: '(?:人|位|名)', 人: '(?:人|位|名)', 錢: '元' }[m[1] || m[2]] || (m[1] || m[2]));
      return new RegExp('[0-9一二三四五六七八九十百兩半]+\\s*(?:個)?' + u).test(wt); };
    const block = (n, x) => '第' + n + '個問題：' + x.title + '\n' + x.summary;
    const merge = (list, base) => { const seen = new Set(); const st = list.flatMap(x => x.statutes || []).filter(x => { const k = x && x.title; if (!k || seen.has(k)) return false; seen.add(k); return true; });
      return { ...base, direct: true, guarded: true, statutes: st, refs: list.flatMap(x => x.refs || []), notes: [...new Set(list.flatMap(x => x.notes || []))], questionState: { focus: 'compound' } }; };
    if (A && B && tA !== tB) {
      const isKB = typeof KB !== 'undefined' && KB.some(e => e.title === W);
      if (a.unanswered || isKB || W === tA || W === tB) {
        if (W === tA && (covers(a, B) || coversQ(a, parts[1].ask)) || W === tB && (covers(a, A) || coversQ(a, parts[0].ask))) return null; // 原答案已經涵蓋另一半的重點
        return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
          summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [],
          actions: (!a.unanswered && a.actions && a.actions.length ? a.actions : A.actions) || [] });
      }
      /* 整句配到第三則答案：保留原答案，把它沒談到的那一半補在後面 */
      if (!a.summary || (a.steps && a.steps.length)) return null;
      const tOnly = { title: a.title }; const cA = covRate(tOnly, A), cB = covRate(tOnly, B); // 整句配到第三則：只拿標題比，內文太長容易誤判成「有談到」
      if (Math.max(cA, cB) < 0.3) return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
        summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [], actions: A.actions || [] }); // 原答案兩半都沒談到
      if (!(Math.max(cA, cB) >= 0.4 && Math.min(cA, cB) < 0.3)) return null;
      const add = [cA < cB ? A : B];
      const lost = add[0] === A ? parts[0].ask : parts[1].ask;
      return merge([a, add[0]], { ...a, summary: a.summary + '\n\n您還問了「' + lost + '」，小屏另外回答：' + add[0].title + '\n' + add[0].summary });
    }
    /* 只答得出一半：原答案就是那一半，而且完全沒談到另一半的主題 → 明講另一半沒有把握 */
    if ((A || B) && !(A && B) && !a.unanswered && W === (tA || tB) && window.AnswerArbiter) {
      const miss = A ? p2 : p1; const WEAK = /^(協會|合作社|理事|監事|會員|社員|理事會|監事會|會員大會|社員大會|理事長|社區發展協會|名額)$/;
      const tp = window.AnswerArbiter.topicsOf(miss).filter(x => !WEAK.test(x)); const at = new Set(window.AnswerArbiter.topicsOf(textOf(a)));
      if (!tp.length || tp.some(x => at.has(x))) return null;
      const shown = A ? parts[0].ask : parts[1].ask, lost = A ? parts[1].ask : parts[0].ask;
      return { ...a, guarded: true, summary: '您一次問了兩件事。下面先回答「' + shown + '」的部分；「' + lost + '」這一部分小屏沒有把握，怕答錯，建議您電洽承辦人員，或把這一部分單獨再問一次。\n\n' + (a.summary || '') };
    }
    return null;
  }
  function guard(q, a) {
    try { const c = compareGuard(q, a) || compareTopic(q, a) || compound(q, a); if (c) return c; } catch (e) {}
    try {
      if (!a || a.direct || a.questionState || a.unanswered || !a.title) return null;
      if ((typeof exactArticleAnswer === 'function' && exactArticleAnswer(q)) || (typeof focusedQuestionAnswer === 'function' && focusedQuestionAnswer(q))) return null; // 會被其他已核對答案取代
      if (typeof KB === 'undefined' || !KB.some(e => e.title === a.title)) return null; // 只把關內建流程型答案
      if (!(a.steps && a.steps.length >= 3)) return null;
      const t = NFK(q);
      if (t.length < 8 || !SPECIFIC.test(t) || HOWTO.test(t)) return null;
      let rel = [a.title, ...similar(q, 6).filter(x => x !== a.title)].slice(0, 7);
      if (rel.length < 2) rel = [a.title, ...similar(q, 3, 0.15).filter(x => x !== a.title)].slice(0, 4); // 找不到夠像的問題時，也不硬給流程答案：至少列出這則流程讓民眾自己選
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
