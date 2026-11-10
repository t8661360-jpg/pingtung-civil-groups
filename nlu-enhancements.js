/**
 * NLU 增強模組 — 針對 P1 級修正的優化
 * 改進問題理解、二義性檢測、上下文追蹤
 */

class NLUEnhancements {
  constructor() {
    this.p1FocusAreas = {
      'chairReelection': {
        keywords: ['理事長', '主席', '連任', '連選', '幾屆', '做幾年', '第二次', '連任一次'],
        relatedTopics: ['改選', '選舉', '任期'],
        antiKeywords: ['辭職', '出缺', '罷免', '解任', '缺'],
        clarifications: [
          '您是在問一般協會理事長能否連任嗎？',
          '您是在問合作社理事主席的連任限制嗎？'
        ]
      },
      'reelectionProportion': {
        keywords: ['改選', '三分之二', '2/3', '二分之一', '1/2', '比例', '人數', '幾人', '多少人'],
        relatedTopics: ['選舉', '會議', '投票'],
        antiKeywords: ['什麼時候', '多久', '期限', '何時', '預告', '通知'],
        examples: [
          '9人改選2/3 = 6人',
          '8人改選2/3 = 6人',
          '12人改選1/2 = 6人',
          '10人改選2/3 = 7人'
        ]
      }
    };
    
    this.ambiguityPatterns = [
      {
        pattern: /理事長(?!.*辭職|出缺|罷免).*(?:連任|連選|幾屆|做幾年)/,
        focus: 'chairReelection',
        clarification: '您想了解理事長是否可以連任',
        confidence: 0.95
      },
      {
        pattern: /(?:改選|選舉).*(?:三分之二|2\/3|二分之一|1\/2|比例|人數|幾人)/,
        focus: 'reelectionProportion',
        clarification: '您想計算改選時需要改選多少人',
        confidence: 0.95
      },
      {
        pattern: /合作社.*(?:理事|主席).*(?:連任|連選|幾次|幾屆)/,
        focus: 'chairReelection',
        domain: 'coop',
        clarification: '您想了解合作社理事主席的連任限制',
        confidence: 0.92
      }
    ];

    this.contextTracking = {
      previousTopic: null,
      followUpKeywords: {
        chairReelection: ['那理事呢', '監事呢', '總幹事呢', '其他職務'],
        reelectionProportion: ['那其他比例', '那8人', '那12人', '還有其他算法嗎']
      }
    };
  }

  /**
   * 增強的二義性檢測
   */
  detectAmbiguity(question) {
    const matches = [];
    
    for (const pattern of this.ambiguityPatterns) {
      if (pattern.pattern.test(question)) {
        matches.push({
          focus: pattern.focus,
          domain: pattern.domain || 'social',
          clarification: pattern.clarification,
          confidence: pattern.confidence,
          examples: this.p1FocusAreas[pattern.focus]?.examples || []
        });
      }
    }
    
    if (matches.length > 1) {
      return {
        isAmbiguous: true,
        matches: matches,
        suggestionMessage: '我找到多個相關的解釋：請選擇您最想了解的' 
      };
    } else if (matches.length === 1) {
      return {
        isAmbiguous: false,
        focus: matches[0].focus,
        domain: matches[0].domain,
        clarification: matches[0].clarification,
        confidence: matches[0].confidence
      };
    }
    
    return { isAmbiguous: false, focus: null };
  }

  /**
   * 計算邏輯驗證
   */
  validateCalculation(input) {
    // 尋找計算模式：「X人改選Y比例」
    const calcPattern = /(\d+)人.*?(?:改選|選舉).*?(?:(\d)分之(\d)|([0-9.]+)%)/;
    const match = input.match(calcPattern);
    
    if (!match) return null;
    
    const totalPeople = parseInt(match[1]);
    const proportion = match[2] && match[3] 
      ? parseInt(match[3]) / parseInt(match[2])  // 分數形式
      : parseInt(match[4]) / 100;  // 百分比形式
    
    const result = Math.ceil(totalPeople * proportion);
    
    return {
      totalPeople,
      proportion: (proportion * 100).toFixed(0) + '%',
      result,
      calculation: `ceil(${totalPeople} × ${proportion}) = ${result}`,
      verification: result > 0 && result <= totalPeople
    };
  }

  /**
   * 上下文追蹤
   */
  trackContext(question, lastTopic) {
    const followUpKeywords = this.contextTracking.followUpKeywords[lastTopic] || [];
    
    if (followUpKeywords.some(kw => question.includes(kw))) {
      return {
        isFollowUp: true,
        previousTopic: lastTopic,
        continuity: '您在追問之前的話題'
      };
    }
    
    return { isFollowUp: false };
  }

  /**
   * 生成增強答案提示
   */
  generateEnhancedPrompt(focus, domain) {
    const prompts = {
      chairReelection: {
        social: `
          ✅ 根據您的問題，我將解釋一般協會理事長的連任規定：
          • 法律上沒有限制理事長連任次數
          • 是否限制取決於團體章程如何規定
          • 實務上常見「連任一次為限」或「連任不超過兩次」
        `,
        coop: `
          ✅ 根據您的問題，我將解釋合作社理事主席的連任規定：
          • 連任以一次為限（最多連續做兩屆）
          • 依合作社法第 20 條
          • 合作社章程可另有規定
        `
      },
      reelectionProportion: {
        social: `
          ✅ 根據您的問題，我將說明改選人數的計算：
          • 使用無條件進位 (ceil) 計算
          • 公式：理事總人數 × 改選比例，不足整數時進位
          • 範例會具體展示計算過程
        `,
        coop: `
          ✅ 根據您的問題，我將說明合作社改選人數的計算：
          • 同樣使用無條件進位 (ceil) 計算
          • 按社員大會決議的改選比例計算
        `
      }
    };
    
    return prompts[focus]?.[domain] || '';
  }

  /**
   * 完整的問題理解流程
   */
  comprehendQuestion(question, lastTopic = null) {
    const result = {
      originalQuestion: question,
      understanding: {},
      suggestions: [],
      nextSteps: []
    };
    
    // 1. 檢測二義性
    const ambiguity = this.detectAmbiguity(question);
    result.understanding.focus = ambiguity.focus;
    result.understanding.domain = ambiguity.domain || 'social';
    result.understanding.confidence = ambiguity.confidence || 0.85;
    
    // 2. 追蹤上下文
    if (lastTopic) {
      const context = this.trackContext(question, lastTopic);
      result.understanding.isFollowUp = context.isFollowUp;
      result.understanding.previousTopic = context.previousTopic;
    }
    
    // 3. 驗證計算（如果涉及）
    const calculation = this.validateCalculation(question);
    if (calculation && calculation.verification) {
      result.calculation = calculation;
      result.suggestions.push(`我計算的結果是 ${calculation.result} 人`);
    }
    
    // 4. 生成增強提示
    result.enhancedPrompt = this.generateEnhancedPrompt(
      result.understanding.focus,
      result.understanding.domain
    );
    
    // 5. 建議下一步
    if (result.understanding.focus === 'chairReelection') {
      result.nextSteps = [
        '確認貴會是否已在章程中訂明理事長連任限制',
        '查閱改選會議紀錄以了解具體規定',
        '如有疑問請洽屏東縣社會處 (08)7360316'
      ];
    } else if (result.understanding.focus === 'reelectionProportion') {
      result.nextSteps = [
        '確認改選會議紀錄中的改選比例',
        '使用提供的計算公式驗證改選人數',
        '依計算結果進行投票'
      ];
    }
    
    return result;
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NLUEnhancements;
}

if (typeof window !== 'undefined') {
  window.NLUEnhancements = NLUEnhancements;
}
