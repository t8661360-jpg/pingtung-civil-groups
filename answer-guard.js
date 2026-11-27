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
  const COMPARE = /一樣嗎|一不一樣|一樣不一樣|有沒有一樣|相同嗎|是否相同|有什麼不同|有何不同|有什麼不一樣|哪裡不同|哪裡不一樣|差別|差在哪|差異|有什麼差|怎麼分|(跟|和|與).{2,14}(一樣|相同)|比較|各是|各要|各幾|各多|各有|各自|分別/;
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
    /* 第3輪：後半換成另一種團體（「…，協會理事長又是怎樣」「…，合作社社員也有戶籍限制嗎」）是在問第二件事，不是承接前半 */
    const ty1 = typesOf(p1), ty2 = typesOf(p2), diffType = ty1.length === 1 && ty2.length === 1 && ty1[0] !== ty2[0];
    const SUF3 = /(又是怎樣|又是怎麼樣|又是如何|又怎樣|又怎麼樣|又如何|也一樣嗎|也是嗎|也是這樣嗎|也相同嗎|也是一樣嗎)$/;
    if (diffType && SUF3.test(p2) && p2.length < 16) { const k = p1.search(/怎麼|如何|可以|可不可以|能不能|幾|多久|多少|誰|要不要|需不需要|有沒有|會不會|一定要/); const subj = p2.replace(SUF3, '').replace(/的$/, '');
      if (k >= 2 && subj.length >= 2) { const re1 = TYPES.find(x => x[0] === ty1[0])[1], re2 = TYPES.find(x => x[0] === ty2[0])[1];
        p2 = subj.replace(new RegExp(re2.source, 'g'), '') ? subj + p1.slice(k) : p1.replace(new RegExp(re1.source), subj); } }
    if (/呢$/.test(p2) && p2.length < 12) { const k = p1.search(/怎麼|如何|可以|可不可以|能不能|幾|多久|多少|誰|要不要|需不需要|有沒有|會不會/); const subj = p2.replace(/呢$/, ''); if (k < 2 || subj.length < 2) return null; p2 = subj + p1.slice(k); }
    if (/^.{0,8}(也|一樣|同樣)/.test(p2) && p2.length < 14 && !diffType) return null; // 「監事會也可以嗎」這種承接問法，照原本整句回答
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
      /* 第3輪：兩半問的是不同種團體，原答案卻只談到其中一種 → 兩半分開回答 */
      if (diffType) { const wt3 = textOf(a); if (![ty1[0], ty2[0]].every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? wt3.replace(/社區發展協會|社區協會/g, '＿') : wt3)))
        return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
          summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [], actions: A.actions || [] }); }
      const tOnly = { title: a.title }; const cA = covRate(tOnly, A), cB = covRate(tOnly, B); // 整句配到第三則：只拿標題比，內文太長容易誤判成「有談到」
      if (Math.max(cA, cB) < 0.3) return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
        summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [], actions: A.actions || [] }); // 原答案兩半都沒談到
      if (!(Math.max(cA, cB) >= 0.4 && Math.min(cA, cB) < 0.3)) return null;
      const qRate = part => { const wt = NFK(a.title); const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOPW.source, 'g')).filter(x => x && x.length >= 2);
        const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); return g.length ? g.filter(x => wt.includes(x)).length / g.length : 1; };
      const rA = qRate(parts[0].ask), rB = qRate(parts[1].ask);
      /* 第3輪：標題用字像前半、內文其實在答後半（「會員入會要理事會通過嗎？入會費可以收多少？」配到「會費、入會費由誰決定」）→ 補的應該是前半 */
      const add = [(cA < cB ? (rA - rB >= 0.25 ? B : A) : (rB - rA >= 0.25 ? A : B))];
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
  /* ── 理解把關第2輪（2026-11-27）──
     接在第1輪（比較題把關、一句問兩件事分開回答）後面：第1輪沒有接手的題目，再看一次「問句」和「答案」是不是同一件事。
     補的是：捐款抵稅一律請洽國稅局；大樓管委會改用既有的業務分流、學校家長會用固定用語；一句問兩件事而分不開回答時，
     答案沒談到其中一個問句的重點就出選單；「順便／同時」辦兩件事只答一件；問句的關鍵細節（颱風停班、住院、被罰）答案完全沒提到。
     每個條件都用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const group = (ask, ans) => ({ ask: new RegExp(ask.map(esc).join('|'), 'i'), ans: new RegExp((ans || ask).map(esc).join('|'), 'i') });
  // 細節主題：問句提到、答案完全沒提到 → 答案沒有在答這個細節
  const DETAILS = [
    group(['颱風', '停班', '停課', '天災', '地震', '豪雨', '停電', '淹水'], ['颱風', '停班', '停課', '天災', '地震', '豪雨', '停電', '淹水', '不可抗力', '緊急事故', '延期', '延後', '改期']),
    group(['住院', '中風', '開刀', '失智', '昏迷', '重病', '病倒'], ['住院', '中風', '開刀', '失智', '昏迷', '重病', '生病', '因故', '不能視事', '不能執行', '無法執行', '不能行使', '出缺', '請假', '代理', '代行', '辭職', '監護', '輔助宣告']),
    group(['典禮', '儀式', '布達', '剪綵', '揭牌']),
    group(['便當', '餐盒', '誤餐', '餐費'], ['便當', '餐盒', '誤餐', '餐費', '餐點', '膳']),
    group(['被罰', '罰款', '罰錢', '罰鍰', '受罰', '會罰', '開罰', '處罰'], ['罰', '處分', '警告', '撤銷', '限期', '整理', '廢止', '解散', '撤免', '停權', '沒有規定', '沒有明文', '註銷', '繳回', '追繳', '收回', '停止補助', '不予補助'])
  ];
  // 混合問題用的主題詞：每組第一個字串是代表名，其餘是同義說法
  const PART_TOPICS = [['連任', '連選', '續任'], ['任期', '任滿', '屆滿', '做幾年', '當幾年', '幾年一任'], ['兼任', '兼', '同時當', '同時擔任', '擔任', '充任'], ['會計', '出納', '財務人員'], ['總幹事', '秘書長', '工作人員', '幹事', '員工'],
    ['配偶', '親屬', '三等親', '三親等', '親戚', '夫妻', '老婆', '太太', '先生', '兒子', '女兒', '家人'], ['會址', '地址', '遷址', '搬家', '搬遷'], ['改名', '名稱', '會名', '名字', '更名'], ['收據'], ['捐款', '捐贈', '捐錢', '捐助'],
    ['剩餘財產', '剩下的錢', '賸餘', '剩餘', '餘款', '剩的錢'], ['解散', '清算'], ['章程'], ['通知'], ['出席', '到場', '法定人數', '流會'], ['委託', '代理出席', '委託書'], ['補選', '遞補', '候補'], ['辭職', '請辭'], ['改選', '選舉', '投票', '選票'],
    ['會費', '入會費', '常年會費', '年費'], ['補助', '核銷'], ['統編', '統一編號'], ['開戶', '帳戶', '存摺'], ['法人', '法院'], ['理事長'], ['常務理事'], ['常務監事'], ['監事', '理監事'], ['理事', '理監事'], ['會員大會', '社員大會', '大會'], ['理事會', '監事會', '理監事會'],
    ['圖記', '印信', '印章'], ['立案證書', '證書'], ['預算', '決算', '財務報表', '報表'], ['工作計畫', '工作報告'], ['薪水', '薪資', '酬勞', '車馬費', '出席費'], ['罷免'], ['除名', '開除', '退會', '出會'], ['入會', '加入'], ['成立', '籌組', '籌備', '設立', '立案'], ['視訊', '線上', '遠距'], ['紀錄', '記錄'], ['勸募', '募款'], ['股金', '股息', '盈餘', '結餘'], ['分會', '分支'], ['查帳', '查核', '稽核', '看帳', '審核帳'], ['稅'], ['名下', '登記在誰', '登記誰', '誰的名字', '過戶', '所有權'], ['土地', '房地', '不動產', '房子', '房屋', '購置']
  ].map(g => ({ name: g[0], re: new RegExp(g.map(esc).sort((x, y) => y.length - x.length).join('|')) }));
  const ACTIONS = [['會址', '地址', '遷址', '搬家', '搬遷'], ['改名', '名稱', '會名', '名字', '更名'], ['圖記', '印信'], ['立案證書'], ['統編', '統一編號'], ['開戶', '銀行帳戶', '存摺'], ['法人登記', '社團法人'], ['解散'], ['理事長變更', '換理事長', '理事長換人', '新理事長']]
    .map(g => ({ name: g[0], re: new RegExp(g.map(esc).join('|')) }));
  const QMARK = /[?？]|嗎|呢$|幾|多少|多久|誰|哪|可以|可不可以|能不能|能否|是否|要不要|需不需要|怎麼|如何|怎樣|還是|有沒有|會不會|算不算|什麼|甚麼/;
  const answerText = a => NFK([a.title, a.summary, (a.steps || []).join(''), (a.notes || []).join(''), (a.docs || []).join(''), (a.guide || []).join(''), (a.where || []).join('')].join('｜'));
  const topicsIn = s => { let t = NFK(s); const out = []; for (const g of PART_TOPICS) { if (g.re.test(t)) { out.push(g); t = t.replace(new RegExp(g.re.source, 'g'), '＿'); } } return out; };
  function splitParts(raw) {
    return String(raw || '').normalize('NFKC').split(/[，,；;。？?！!\n]+|另外|還有|順便|以及|同時也|然後/).map(s => s.replace(/\s+/g, '').replace(/^(也|又|再|那|那麼|請問|想問|想請問)+/, '')).filter(s => s.length >= 4);
  }
  // 從已驗證題庫挑「同一種團體、同一個主題」的問題當選單
  function pickByTopic(test, topics, n) {
    const list = (typeof window.keywordQuestions === 'function' && window.keywordQuestions()) || [];
    const sc = [];
    for (const c of list) { const t = NFK(c); if (!test(t)) continue; let k = 0; for (const g of topics) if (g.re.test(t)) k++; if (k) sc.push([k, t.length, c]); }
    sc.sort((x, y) => (y[0] - x[0]) || (x[1] - y[1]));
    const out = [], seen = new Set();
    for (const [, , c] of sc) { const h = NFK(c).slice(0, 7); if (seen.has(h)) continue; seen.add(h); out.push(c); if (out.length >= n) break; }
    return out;
  }
  function fixedPhrase2(q, rel) {
    let sf = [], line = '';
    try { sf = staffFor(detectType(q), detectCat(q)) || []; line = contactLine(sf) || ''; } catch (e) {}
    try { if (typeof reportUnanswered === 'function') reportUnanswered(q); } catch (e) {}
    return { category: '其他', title: '抱歉，這個問題難倒小屏了', summary: '抱歉，這個問題難倒小屏了，小屏暫時無法回答喔！建議您先電洽承辦人員詢問～' + line + '小屏已經把這個問題記下來，會請承辦人員補上答案，下次您再問就有囉。',
      staff: sf, related: rel || [], notes: [], steps: [], docs: [], laws: [], actions: [{ label: '聯絡承辦', view: 'contact', sub: '' }, { label: '回到常見問題', view: 'home', sub: '' }], unanswered: true, guarded: true, questionState: { focus: 'guard-menu' } };
  }
  function menu2(q, rel, why) {
    const seen = new Set(), list = [];
    for (const x of rel) { if (!x || seen.has(x)) continue; seen.add(x); list.push(x); if (list.length >= 8) break; }
    if (list.length < 2) for (const x of similar(q, 3, 0.15)) { if (!seen.has(x)) { seen.add(x); list.push(x); } } // 找不到夠像的問題時放寬一點，仍然沒有才用固定用語
    if (!list.length) return fixedPhrase2(q, list);
    return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
      summary: (why || '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。') + '請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
      related: list, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true };
  }
  function understandingGuard(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify') return null;
    if ((a.groups && a.groups.length) || a.category === '團體查詢' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 8) return null;
    const at = answerText(a);
    // 0. 捐款抵稅：只答「請洽國稅局」
    if (/捐/.test(raw) && /抵.{0,4}稅|節稅|扣除額|列舉扣除/.test(raw) && !/合作社|社員/.test(raw) && !/國稅局/.test(a.title)) {
      try { const tax = verifiedRoundAnswer('捐款可以抵稅嗎', {}); if (tax && /國稅局/.test(tax.title || '')) return Object.assign({}, tax, { direct: true, guarded: true }); } catch (e) {}
    }
    if (a.category === '業務分流') return null;
    // 1. 不是本櫃檯的對象（大樓管委會、學校家長會）：答案沒有在談它，就不拿協會的答案硬配
    const oos = raw.match(/公寓大廈|管委會|管理委員會|(?:大樓|社區)的?主委|家長會|家長委員/);
    if (oos) {
      const condo = !/家長/.test(oos[0]);
      if (!(condo ? /管委會|管理委員會|公寓大廈/.test(at) : /家長會|家長委員/.test(at))) {
        if (condo) { try { const r = verifiedRoundAnswer('公寓大廈管理委員會要怎麼成立', {}); if (r && r.category === '業務分流') return Object.assign({}, r, { direct: true, guarded: true }); } catch (e) {} }
        return fixedPhrase2(q, []);
      }
    }
    // 3. 一句問兩件事：每一個問句的重點，答案都要有談到
    const parts = splitParts(q).filter(p => QMARK.test(p)).map(p => ({ p, ts: topicsIn(p) })).filter(x => x.ts.length);
    if (parts.length >= 2) {
      const cov = x => x.ts.filter(g => g.re.test(at)).length / x.ts.length;
      const miss = parts.filter(x => cov(x) < 0.6);
      if (miss.length) {
        const rel = []; const per = Math.max(2, Math.floor(8 / parts.length));
        for (const x of parts) rel.push(...similar(x.p, per));
        return menu2(q, rel, '您一次問了不只一件事，小屏怕只答到其中一半。');
      }
    }
    // 3b. 「順便／一起／同時」辦兩件事（例如改名＋換會址）：兩件事答案都要有談到
    if (/順便|一起|同時|一併|另外|還有/.test(raw)) {
      const acts = ACTIONS.filter(g => g.re.test(raw));
      if (acts.length >= 2 && acts.some(g => !g.re.test(at))) { const rel = []; for (const g of acts) rel.push(...pickByTopic(t => !/合作社/.test(t) || /合作社/.test(raw), [g], 3)); return menu2(q, rel.length >= 2 ? rel : similar(q, 8), '您一次問了不只一件事，小屏怕只答到其中一半。'); }
    }
    // 4. 問句裡的關鍵細節，答案完全沒提到
    for (const d of DETAILS) if (d.ask.test(raw) && !d.ans.test(at)) return menu2(q, [a.title.length <= 30 && !a.direct ? a.title : '', ...similar(q, 7)], '');
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard2 = understandingGuard;
  /* ── 理解把關第3輪（2026-11-27）──
     A. 不是本櫃檯對象、本站也沒有已核對分流資料的組織（農會、漁會、農田水利會、公司的董事股東）：答案沒有在談它，
        就不拿協會的答案硬配，用固定用語。一般勞資糾紛（不是協會自己的員工）列出相近題讓民眾選。
     B. 條件加例外（「如果…但是他是理事，還能出席理事會嗎」）：最後真正在問的那一句，答案要有談到；沒談到就出選單。
     每個條件都用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const OOS3 = [
    { ask: /農會|漁會|農田水利會|水利會/, ans: /農會|漁會|水利會/ },
    { ask: /(公司|股份有限|有限公司).{0,12}(董事|監察人|股東|資本額|公司登記)|(董事|監察人|股東會|資本額).{0,12}(公司|股份有限)/, ans: /公司|董事|股東/ }
  ];
  const LABOR3 = { ask: /勞資(糾紛|爭議|調解|問題)|勞資雙方/, ans: /勞資|勞工主管|勞動/ };
  const COND3 = /(如果|假如|要是|萬一|假設|雖然).{2,40}?(但是|可是|不過|但|卻)/;
  const STOP3 = /可不可以|可以|能不能|能否|是否|怎麼辦|怎麼|如何|怎樣|什麼|甚麼|要不要|需不需要|有沒有|會不會|還能|還要|還可以|還是|還有|的話|這樣|那樣|請問|幾|多少|多久|嗎|呢|或|和|跟|與|的|了|要|是|又|也|他|她|還|能|會|就/;
  const rate3 = (part, wt) => { const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOP3.source, 'g')).filter(x => x && x.length >= 2);
    const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); return g.length >= 2 ? g.filter(x => wt.includes(x)).length / g.length : 1; };
  function understandingGuard3(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify') return null;
    if (a.category === '業務分流' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 5) return null;
    const at = answerText(a);
    for (const o of OOS3) if (o.ask.test(raw) && !o.ans.test(at)) return fixedPhrase2(q, []);
    if (LABOR3.ask.test(raw) && !LABOR3.ans.test(at)) return menu2(q, similar(q, 6), '');
    if ((a.groups && a.groups.length) || a.category === '團體查詢') return null;
    /* C. 前後兩句各問一種團體（「社區發展協會可以收會費嗎，合作社也是嗎」），答案只談到其中一種 → 選單 */
    const cl = String(q || '').normalize('NFKC').split(/[，,；;。？?！!]+/).map(x => NFK(x)).filter(x => x.length >= 3);
    if (cl.length >= 2 && !/兩件事|分別|分開/.test(a.title)) {
      const t1 = typesOf(cl[0]), k = cl.findIndex((x, i) => i > 0 && QMARK.test(x) && typesOf(x).length === 1 && t1.length === 1 && typesOf(x)[0] !== t1[0] && !/改成|變成|轉型|轉成|改制|加入|合併|成立|籌組|申請/.test(x));
      if (k > 0 && QMARK.test(cl[0])) { const need = [t1[0], typesOf(cl[k])[0]];
        if (!need.every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at))) return menu2(q, [...similar(cl[0], 3), ...similar(cl[k], 3), ...similar(q, 4)], '您一次問了兩種團體，小屏怕只答到其中一種。'); }
    }
    const m = raw.match(COND3);
    if (m && raw.length >= 14) {
      const tail = raw.slice(m.index + m[0].length);
      const asks = tail.split(/[，,；;。？?！!]+/).filter(x => x.length >= 4 && QMARK.test(x));
      const last = asks[asks.length - 1];
      if (last && rate3(last, at) < 0.5) return menu2(q, [...similar(last, 3), ...similar(q, 6)], '');
    }
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard3 = understandingGuard3;
  function guard(q, a) {
    try { const c = compareGuard(q, a) || compareTopic(q, a) || compound(q, a); if (c) return c; } catch (e) {}
    try { const u = understandingGuard(q, a); if (u) return u; } catch (e) {}
    try { const u3 = understandingGuard3(q, a); if (u3) return u3; } catch (e) {}
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
