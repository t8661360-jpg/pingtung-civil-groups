/**
 * NLU 集成層 - 與櫃檯應用整合
 * 
 * 功能:
 * 1. 理解進度提示機制
 * 2. 問題與答案的映射
 * 3. 用戶反饋回路
 */

class NLUIntegration {
  constructor(nluEngine, answerSource) {
    this.nlu = nluEngine;
    this.answers = answerSource; // 指向 round-fixes.js 的答案庫
    this.conversationHistory = [];
    this.userProfile = {};
  }

  /**
   * 異步理解問題 - 顯示進度
   */
  async understandQuestion(question, onProgress = null) {
    const stages = [
      { stage: 'preprocess', message: '正在規範化問題...', progress: 20 },
      { stage: 'intent', message: '正在辨識意圖...', progress: 40 },
      { stage: 'entities', message: '正在提取關鍵信息...', progress: 60 },
      { stage: 'context', message: '正在整合上下文...', progress: 80 },
      { stage: 'complete', message: '理解完成！', progress: 100 }
    ];

    // 逐階段更新進度
    for (const stage of stages) {
      if (onProgress) {
        onProgress({
          stage: stage.stage,
          message: stage.message,
          progress: stage.progress
        });
      }
      // 模擬處理時間
      await new Promise(r => setTimeout(r, 100));
    }

    // 執行完整分析
    const analysis = await this.nlu.analyze(
      question,
      this.conversationHistory[this.conversationHistory.length - 1]?.analysis
    );

    // 儲存對話歷史
    this.conversationHistory.push({
      question,
      analysis,
      timestamp: new Date().toISOString()
    });

    return analysis;
  }

  /**
   * 根據理解結果生成答案
   */
  async generateAnswer(analysis) {
    const { intent, entities, ambiguities, readyForAnswer } = analysis;

    // 如果有二義性，先要求澄清
    if (ambiguities.length > 0 && !readyForAnswer) {
      return {
        type: 'clarification-needed',
        message: '我需要澄清一下您的問題',
        ambiguities,
        suggestedClarifications: this.suggestClarifications(analysis)
      };
    }

    // 根據意圖尋找答案
    const answer = this.findAnswerByIntent(intent, entities);

    if (answer) {
      return {
        type: 'answer',
        confidence: intent.confidence,
        ...answer
      };
    }

    // 沒找到確切答案，提供最相近的選項
    return {
      type: 'related-options',
      message: '我找到以下相關的資訊，是您想問的嗎？',
      options: this.findRelatedAnswers(intent, entities)
    };
  }

  /**
   * 根據意圖尋找答案
   */
  findAnswerByIntent(intent, entities) {
    // 這裡會映射到 round-fixes.js 的答案
    const intentMap = {
      'quorum-check': {
        question: `${entities.number || ''}理事會開會人數要求`,
        method: 'vacancyQuorum'
      },
      'term-length': {
        question: '理監事任期長度',
        method: 'termLength'
      },
      'reelection-window': {
        question: '改選期限和窗口',
        method: 'reelectionWindow'
      },
      // ... 其他意圖映射
    };

    const mapping = intentMap[intent.intent];
    if (mapping) {
      return {
        intent: intent.intent,
        intentDescription: intent.description,
        mappedQuestion: mapping.question,
        answerMethod: mapping.method
      };
    }

    return null;
  }

  /**
   * 尋找相關答案
   */
  findRelatedAnswers(intent, entities) {
    // 根據實體提取的信息，找相關的其他答案
    return [
      {
        title: '可能想問：理事會的開會人數要求',
        description: '理事會要有理事過半數出席才能成會'
      },
      {
        title: '可能想問：改選的期限',
        description: '一般協會應於任期屆滿前一個月內改選'
      }
    ];
  }

  /**
   * 建議澄清問題的方式
   */
  suggestClarifications(analysis) {
    const { ambiguities } = analysis;
    const clarifications = [];

    for (const ambiguity of ambiguities) {
      if (ambiguity.word === '可以') {
        clarifications.push(
          '您是問「能否開會」還是「是否允許這樣做」？'
        );
      } else if (ambiguity.word === '幾人') {
        clarifications.push(
          '您是問「需要幾個人」還是「哪些人」？'
        );
      } else if (ambiguity.word === '剩') {
        clarifications.push(
          '您是問「現在剩多少人」還是「還剩多少時間」？'
        );
      }
    }

    return clarifications;
  }

  /**
   * 記錄用戶反饋 - 用於改進 NLU
   */
  recordFeedback(question, analysis, userFeedback) {
    const feedback = {
      question,
      originalIntent: analysis.intent,
      userCorrectedIntent: userFeedback.correctIntent,
      userExplanation: userFeedback.explanation,
      timestamp: new Date().toISOString(),
      helpful: userFeedback.helpful
    };

    // 可以用這些反饋訓練改進 NLU
    console.log('📝 用戶反饋已記錄:', feedback);
    
    return feedback;
  }

  /**
   * 取得對話摘要
   */
  getConversationSummary() {
    return {
      totalQuestions: this.conversationHistory.length,
      intents: [...new Set(this.conversationHistory.map(h => h.analysis.intent.intent))],
      ambiguitiesEncountered: this.conversationHistory.filter(h => h.analysis.ambiguities.length > 0).length,
      history: this.conversationHistory
    };
  }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NLUIntegration;
}
