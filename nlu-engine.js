/**
 * 自然語言理解引擎 (NLU Engine)
 * 
 * 功能:
 * 1. 問題預處理 (正規化、去除雜音)
 * 2. 意圖辨識 (identify intent)
 * 3. 實體抽取 (entity extraction)
 * 4. 語義相似度比對 (semantic matching)
 * 5. 上下文追蹤 (context tracking)
 * 
 * 用途: 理解民眾五花八門的問法，提供準確答案
 */

class NLUEngine {
  constructor() {
    // 問題同義詞對應表
    this.synonyms = {
      理事長: ['主席', '會長', '理事長'],
      出席: ['參加', '出席', '現身', '到場'],
      開會: ['開會', '召開', '舉行', '進行'],
      改選: ['改選', '換屆', '選舉', '選理事'],
      多少人: ['幾人', '多少人', '幾個', '幾位'],
      過半數: ['過半', '超過一半', '多數', '50%以上'],
      認可: ['同意', '贊成', '認可', '核准'],
    };

    // 意圖模式匹配
    this.intentPatterns = [
      {
        intent: 'quorum-check',
        keywords: ['開會', '成會', '出席', '幾人', '多少人'],
        description: '確認理事會/監事會的開會人數要求'
      },
      {
        intent: 'term-length',
        keywords: ['任期', '幾年', '多久', '做幾年'],
        description: '查詢理監事任期長度'
      },
      {
        intent: 'reelection-window',
        keywords: ['改選', '何時', '什麼時候', '期限'],
        description: '查詢改選期限和窗口'
      },
      {
        intent: 'notice-deadline',
        keywords: ['通知', '寄發', '提前', '幾天'],
        description: '查詢會議通知期限'
      },
      {
        intent: 'vacancy-handling',
        keywords: ['出缺', '補選', '辭職', '空缺'],
        description: '處理職位出缺的補選問題'
      },
      {
        intent: 'document-requirement',
        keywords: ['資料', '文件', '應備', '需要帶'],
        description: '查詢改選所需文件和書表'
      },
      {
        intent: 'meeting-frequency',
        keywords: ['多久', '幾次', '頻率', '多常'],
        description: '查詢理事會/監事會的開會頻率'
      },
      {
        intent: 'assembly-quorum',
        keywords: ['會員大會', '社員大會', '人數', '通知'],
        description: '查詢大會的人數要求和通知期限'
      },
    ];

    // 實體提取規則
    this.entityPatterns = {
      number: /(\d+|[一二三四五六七八九十百千萬兩]+)\s*人/,
      duration: /(\d+|[一二三四五六七八九十百千萬兩]+)\s*(?:年|個月|天|小時)/,
      organization: /(?:協會|合作社|工會|公會|理事會|監事會|會員大會|社員大會)/,
      role: /(?:理事長|監事長|理事|監事|會長|主席)/,
    };

    // 陷阱詞 - 可能導致誤解的詞彙
    this.trapWords = [
      {
        word: '可以',
        explanation: '可能表示「能否」或「是否允許」'
      },
      {
        word: '幾人',
        explanation: '可能指「幾個人」或「哪些人」'
      },
      {
        word: '剩',
        explanation: '可能指「現在剩下」或「還剩下時間」'
      },
    ];
  }

  /**
   * 預處理: 正規化問題
   */
  preprocess(question) {
    let q = String(question || '').trim();
    
    // 標準化繁簡體
    q = q.replace(/\s+/g, '');
    
    // 移除常見語氣詞
    q = q.replace(/[呢嗎啦喔耶嘞呀]/g, '');
    
    // 將「?」和「？」統一為「？」
    q = q.replace(/\?+/g, '？');
    q = q.replace(/？{2,}/g, '？');
    
    return q;
  }

  /**
   * 意圖辨識
   */
  identifyIntent(question) {
    const q = this.preprocess(question);
    const matches = [];

    for (const pattern of this.intentPatterns) {
      const score = pattern.keywords.filter(kw => q.includes(kw)).length;
      if (score > 0) {
        matches.push({
          intent: pattern.intent,
          confidence: score / pattern.keywords.length,
          description: pattern.description
        });
      }
    }

    // 按信心度排序
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches.length > 0 ? matches[0] : { intent: 'unknown', confidence: 0 };
  }

  /**
   * 實體抽取
   */
  extractEntities(question) {
    const q = this.preprocess(question);
    const entities = {};

    for (const [entityType, pattern] of Object.entries(this.entityPatterns)) {
      const match = q.match(pattern);
      if (match) {
        entities[entityType] = match[0];
      }
    }

    return entities;
  }

  /**
   * 問題規範化 - 將各種表述轉為標準問題
   */
  normalizeSynonyms(question) {
    let normalized = this.preprocess(question);

    // 同義詞替換
    for (const [canonical, synonyms] of Object.entries(this.synonyms)) {
      for (const synonym of synonyms) {
        if (synonym !== canonical) {
          const regex = new RegExp(synonym, 'g');
          normalized = normalized.replace(regex, canonical);
        }
      }
    }

    return normalized;
  }

  /**
   * 檢查可能的二義性
   */
  detectAmbiguity(question) {
    const q = this.preprocess(question);
    const ambiguities = [];

    for (const trap of this.trapWords) {
      if (q.includes(trap.word)) {
        ambiguities.push({
          word: trap.word,
          explanation: trap.explanation,
          position: q.indexOf(trap.word)
        });
      }
    }

    return ambiguities;
  }

  /**
   * 完整 NLU 分析流程
   */
  async analyze(question, previousContext = null) {
    const startTime = Date.now();

    // 階段 1: 預處理
    const preprocessed = this.preprocess(question);

    // 階段 2: 意圖辨識
    const intent = this.identifyIntent(preprocessed);

    // 階段 3: 實體抽取
    const entities = this.extractEntities(preprocessed);

    // 階段 4: 規範化同義詞
    const normalized = this.normalizeSynonyms(preprocessed);

    // 階段 5: 二義性檢測
    const ambiguities = this.detectAmbiguity(preprocessed);

    // 階段 6: 上下文整合
    const contextEnhanced = this.enhanceWithContext(
      { preprocessed, intent, entities, normalized, ambiguities },
      previousContext
    );

    const elapsedTime = Date.now() - startTime;

    return {
      originalQuestion: question,
      preprocessed,
      intent,
      entities,
      normalized,
      ambiguities,
      contextEnhanced,
      understandingProgress: {
        stage: 'completed',
        percentage: 100,
        message: '問題理解完成'
      },
      processingTime: `${elapsedTime}ms`,
      confidence: intent.confidence,
      readyForAnswer: intent.confidence > 0.3 && ambiguities.length === 0,
      recommendations: this.generateRecommendations(
        { intent, entities, ambiguities },
        previousContext
      )
    };
  }

  /**
   * 上下文增強
   */
  enhanceWithContext(analysis, previousContext) {
    if (!previousContext) return analysis;

    return {
      ...analysis,
      contextCarryover: {
        previousIntent: previousContext.intent,
        previousDomain: previousContext.domain,
        followUp: this.isFollowUp(analysis.preprocessed, previousContext)
      }
    };
  }

  /**
   * 判斷是否為追問
   */
  isFollowUp(question, previousContext) {
    const followUpMarkers = ['那', '所以', '如果', '那麼', '那樣'];
    return followUpMarkers.some(marker => question.startsWith(marker));
  }

  /**
   * 生成建議
   */
  generateRecommendations(analysis, previousContext) {
    const recs = [];

    // 建議 1: 基於意圖的後續問題
    if (analysis.intent.confidence < 0.5) {
      recs.push({
        type: 'clarify',
        message: '意圖辨識不確定，建議澄清問題',
        suggestedQuestions: this.suggestClarifications(analysis)
      });
    }

    // 建議 2: 基於二義性的提示
    if (analysis.ambiguities.length > 0) {
      recs.push({
        type: 'ambiguity-warning',
        message: `發現可能的歧義: ${analysis.ambiguities.map(a => a.word).join(', ')}`,
        ambiguities: analysis.ambiguities
      });
    }

    // 建議 3: 基於實體的相關查詢
    if (Object.keys(analysis.entities).length > 0) {
      recs.push({
        type: 'entity-related',
        message: '可能相關的查詢',
        relatedQuestions: this.generateRelatedQuestions(analysis.entities)
      });
    }

    return recs;
  }

  /**
   * 建議澄清問題
   */
  suggestClarifications(analysis) {
    return [
      '您是在問理事會或監事會？',
      '您的組織是協會還是合作社？',
      '您想知道的是具體人數還是規則？'
    ];
  }

  /**
   * 生成相關問題
   */
  generateRelatedQuestions(entities) {
    const questions = [];
    
    if (entities.number) {
      questions.push(`${entities.number}是否符合法定要求？`);
    }
    
    if (entities.organization) {
      questions.push(`關於${entities.organization}的其他規定？`);
    }
    
    return questions;
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NLUEngine;
}
