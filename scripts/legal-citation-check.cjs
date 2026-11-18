'use strict';
// Lexical verification only. This is not a legal opinion or an approval gate.
const norm = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, '');
function articleNumber(value) {
  const s = norm(value);
  const m = s.match(/^(?:第)?(\d+)(?:(?:-|之)(\d+))?(?:條)?(?:之(\d+))?$/);
  if (!m || (m[2] && m[3])) return null;
  return String(Number(m[1])) + (m[2] || m[3] ? '-' + Number(m[2] || m[3]) : '');
}
function checkReply(item, reply, lawIndex) {
  const problems = [];
  const reminders = ['自動核對只確認法規庫內條號、提供範圍及引文文字，不確認現行效力、適用對象、論證或法律結論；仍須人工實質審查。'];
  const validObject = reply && typeof reply === 'object' && !Array.isArray(reply);
  if (!validObject) problems.push('回覆不是有效的 JSON 物件');
  const r = validObject ? reply : {};
  if (typeof r.conclusion !== 'string' || !r.conclusion.trim()) problems.push('缺少結論');
  if (typeof r.gaps !== 'string') problems.push('缺少原文不足說明 gaps');
  if (!['high', 'medium', 'low'].includes(r.confidence)) problems.push('confidence 格式錯誤');
  if (r.confidence === 'low') problems.push('回覆自評信心低');
  const cites = Array.isArray(r.cites) ? r.cites : [];
  if (!cites.length) problems.push('沒有引用任何法條');
  const given = new Set((item.statutes || []).map(s => s.law + '|' + articleNumber(s.article)));
  for (const cite of cites) {
    if (!cite || typeof cite !== 'object') { problems.push('引用格式錯誤'); continue; }
    const no = articleNumber(cite.article);
    const law = typeof cite.law === 'string' ? lawIndex[cite.law] : null;
    const original = no && law && law.articles ? law.articles[no] : null;
    if (original == null) { problems.push('查無此條：' + String(cite.law || '') + ' ' + String(cite.article || '')); continue; }
    if (!given.has(cite.law + '|' + no)) problems.push('引用不在本題提供範圍：' + cite.law + ' ' + no);
    if (typeof cite.quote !== 'string' || !cite.quote.trim()) problems.push('引用缺少逐字原文：' + cite.law + ' ' + no);
    else if (!norm(original).includes(norm(cite.quote))) problems.push('引文不是原文逐字：' + cite.law + ' ' + no);
  }
  for (const keyword of item.mustInclude || []) if (!norm(r.conclusion).includes(norm(keyword))) problems.push('結論缺少關鍵詞：' + keyword);
  if (/法規(?:無|沒有)明文/.test(String(r.conclusion || ''))) reminders.push('「本題提供原文未載」不等於全部現行法規均無規定；須先檢查法源是否收錄完整。');
  return {
    status: problems.length ? '待人工' : '原文核對通過（仍待人工實質審查）',
    problems, reminders,
    verification_scope: 'supplied-statutes-and-literal-quotes-only',
    legal_approval: false,
    requires_human_review: true
  };
}
module.exports = { norm, articleNumber, checkReply };
