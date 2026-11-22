/**
 * 語意增強模組：只辨識問題與提供數學輔助，不產生法律結論。
 * 法律答案必須來自已覆核的規則及法規原文，不能由提示文字取代。
 */
class NLUEnhancements {
  constructor() {
    this.p1FocusAreas = {
      chairReelection: {
        keywords: ['理事長', '主席', '連任', '連選', '幾屆', '做幾年', '第二次', '連任一次'],
        relatedTopics: ['改選', '選舉', '任期'],
        antiKeywords: ['辭職', '出缺', '罷免', '解任', '缺'],
        clarifications: ['您是在問一般協會理事長能否連任嗎？', '您是在問合作社理事主席的連任限制嗎？']
      },
      reelectionProportion: {
        keywords: ['改選', '三分之二', '2/3', '二分之一', '1/2', '比例', '人數', '幾人'],
        relatedTopics: ['選舉', '會議', '投票'],
        antiKeywords: ['什麼時候', '多久', '期限', '何時', '預告', '通知'],
        examples: ['純數學範例：9 × 2/3 = 6；不表示法律要求改選6人。']
      }
    };
    this.ambiguityPatterns = [
      { pattern: /理事長(?!.*(?:辭職|出缺|罷免)).*(?:連任|連選|幾屆|做幾年)/, focus: 'chairReelection', clarification: '您想了解理事長的連任規定', confidence: 0.95 },
      { pattern: /(?:改選|選舉).*(?:三分之二|2\/3|二分之一|1\/2|比例|人數|幾人)/, focus: 'reelectionProportion', clarification: '需要先確認這個比例的法規依據與計算基數', confidence: 0.95 },
      { pattern: /合作社.*(?:理事|主席).*(?:連任|連選|幾次|幾屆)/, focus: 'chairReelection', domain: 'coop', clarification: '您想了解合作社理事主席的連任規定', confidence: 0.92 }
    ];
    this.contextTracking = {
      previousTopic: null,
      followUpKeywords: {
        chairReelection: ['那理事呢', '監事呢', '總幹事呢', '其他職務'],
        reelectionProportion: ['那其他比例', '那8人', '那12人', '還有其他算法嗎']
      }
    };
  }
  detectAmbiguity(question) {
    const text = String(question || '');
    const matches = this.ambiguityPatterns.filter(p => p.pattern.test(text)).map(p => ({
      focus: p.focus, domain: p.domain || 'social', clarification: p.clarification,
      confidence: p.confidence, examples: this.p1FocusAreas[p.focus]?.examples || []
    }));
    if (matches.length > 1) return { isAmbiguous: true, matches, suggestionMessage: '請先確認團體類型與問題，再查適用規定。' };
    if (matches.length === 1) return { isAmbiguous: false, ...matches[0] };
    return { isAmbiguous: false, focus: null };
  }
  validateCalculation(input) {
    const match = String(input || '').match(/(\d+)人.*?(?:改選|選舉).*?(?:(\d+)分之(\d+)|(\d+(?:\.\d+)?)%)/);
    if (!match) return null;
    const totalPeople = Number(match[1]);
    const denominator = match[2] === undefined ? null : Number(match[2]);
    const proportion = denominator === null ? Number(match[4]) / 100 : Number(match[3]) / denominator;
    if (!Number.isSafeInteger(totalPeople) || totalPeople <= 0 || denominator === 0 || !Number.isFinite(proportion) || proportion <= 0 || proportion > 1) return null;
    const result = Math.ceil(totalPeople * proportion);
    return {
      totalPeople, proportion: String(Number((proportion * 100).toFixed(6))) + '%', result,
      calculation: `ceil(${totalPeople} × ${proportion}) = ${result}`,
      verification: result > 0 && result <= totalPeople,
      mathematicalOnly: true, requiresLegalBasis: true,
      warning: '這只是所輸入比例的向上取整計算，不表示法律要求改選此人數；「過半數」等嚴格門檻不能直接套用。'
    };
  }
  trackContext(question, lastTopic) {
    const keywords = this.contextTracking.followUpKeywords[lastTopic] || [];
    return keywords.some(kw => String(question || '').includes(kw))
      ? { isFollowUp: true, previousTopic: lastTopic, continuity: '您在追問之前的話題' }
      : { isFollowUp: false };
  }
  generateEnhancedPrompt(focus, domain) {
    const topics = { chairReelection: '任期與連任', reelectionProportion: '人數與比例' };
    if (!topics[focus]) return '';
    const kind = domain === 'coop' ? '合作社' : '人民團體';
    return `問題分類：${kind}的${topics[focus]}。這是語意提示，不是法律結論。請讀取已覆核規則及適用法規原文；不得從本提示推定任期、連任次數、改選比例或條號。`;
  }
  comprehendQuestion(question, lastTopic = null) {
    const result = { originalQuestion: question, understanding: {}, suggestions: [], nextSteps: [] };
    const ambiguity = this.detectAmbiguity(question);
    result.understanding.focus = ambiguity.focus || null;
    result.understanding.domain = ambiguity.domain || (/合作社/.test(String(question || '')) ? 'coop' : 'social');
    result.understanding.confidence = ambiguity.confidence || 0.85;
    result.understanding.isAmbiguous = ambiguity.isAmbiguous;
    if (ambiguity.matches) result.understanding.matches = ambiguity.matches;
    if (lastTopic) Object.assign(result.understanding, this.trackContext(question, lastTopic));
    const calculation = this.validateCalculation(question);
    if (calculation) {
      result.calculation = calculation;
      result.suggestions.push(`純數學計算結果為 ${calculation.result} 人。${calculation.warning}`);
    }
    result.enhancedPrompt = this.generateEnhancedPrompt(result.understanding.focus, result.understanding.domain);
    if (result.understanding.focus === 'chairReelection') {
      result.nextSteps = ['確認團體類型、職務及章程條文', '查閱已覆核的適用法規與選舉紀錄', '如有疑問請洽屏東縣政府總機 08-7320415 轉承辦人員'];
    } else if (result.understanding.focus === 'reelectionProportion') {
      result.nextSteps = ['先確認問題是改選、遞補、成會或表決人數', '核對法規所定基數及門檻，再進行數學計算', '依已覆核的規定辦理，不以語意提示或純數學結果作為法律依據'];
    }
    return result;
  }
}
if (typeof module !== 'undefined' && module.exports) module.exports = NLUEnhancements;
if (typeof window !== 'undefined') window.NLUEnhancements = NLUEnhancements;
