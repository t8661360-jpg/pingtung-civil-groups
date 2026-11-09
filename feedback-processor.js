/**
 * 反饋處理模塊 (Feedback Processor)
 * 用途: 進階反饋處理 - 去重、過濾、分析
 * 
 * 功能:
 *   - 反饋去重 (相似度檢測)
 *   - 自動分類優化
 *   - 高頻問題檢測
 *   - 統計分析
 */

class FeedbackProcessor {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 計算字符串相似度 (Levenshtein 距離)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  }

  /**
   * 檢測重複反饋 (相似度 > 0.8)
   */
  detectDuplicate(feedback, existingFeedbacks, threshold = 0.8) {
    for (const existing of existingFeedbacks) {
      const questionSim = this.calculateSimilarity(
        feedback.question.toLowerCase(),
        existing.question.toLowerCase()
      );

      if (questionSim > threshold) {
        return {
          isDuplicate: true,
          similar: existing,
          similarity: questionSim
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * 批量去重
   */
  deduplicateFeedbacks(feedbacks, threshold = 0.8) {
    const result = [];
    const indices = [];

    for (let i = 0; i < feedbacks.length; i++) {
      let isDuplicate = false;

      for (let j = 0; j < result.length; j++) {
        const sim = this.calculateSimilarity(
          feedbacks[i].question.toLowerCase(),
          result[j].question.toLowerCase()
        );

        if (sim > threshold) {
          isDuplicate = true;
          result[j].duplicateCount = (result[j].duplicateCount || 1) + 1;
          result[j].duplicateIndices = result[j].duplicateIndices || [];
          result[j].duplicateIndices.push(i);
          break;
        }
      }

      if (!isDuplicate) {
        result.push({
          ...feedbacks[i],
          duplicateCount: 1,
          originalIndex: i
        });
      }
    }

    return result;
  }

  /**
   * 統計反饋分布
   */
  analyzeDistribution(feedbacks) {
    const stats = {
      total: feedbacks.length,
      by_type: {},
      by_priority: {},
      duplicates: 0,
      high_frequency: []
    };

    const questionMap = new Map();

    for (const feedback of feedbacks) {
      // 統計類型
      const type = feedback.type || 'unknown';
      stats.by_type[type] = (stats.by_type[type] || 0) + 1;

      // 統計優先級
      const priority = this.calculatePriority(feedback.type);
      stats.by_priority[priority] = (stats.by_priority[priority] || 0) + 1;

      // 高頻問題檢測 - 用相似度而不是字面相同
      // 這裡我們統計所有提及的問題
      const q = feedback.question.toLowerCase();
      
      // 檢查是否與現有的問題相似
      let foundSimilar = false;
      for (const [existingQ, count] of questionMap) {
        if (this.calculateSimilarity(q, existingQ) > 0.6) {
          questionMap.set(existingQ, count + 1);
          foundSimilar = true;
          break;
        }
      }
      
      if (!foundSimilar) {
        questionMap.set(q, 1);
      }

      // 統計重複
      if (feedback.duplicateCount && feedback.duplicateCount > 1) {
        stats.duplicates += feedback.duplicateCount - 1;
      }
    }

    // 提取高頻問題 (>= 2 人，因為可能有多個反饋)
    for (const [question, count] of questionMap) {
      if (count >= 2) {
        stats.high_frequency.push({
          question,
          count,
          priority: this.estimatePriority(question)
        });
      }
    }

    // 按頻率排序
    stats.high_frequency.sort((a, b) => b.count - a.count);

    return stats;
  }

  /**
   * 自動優先級評分
   */
  calculatePriority(type) {
    const priorities = {
      'error': 'P0-critical',
      'missing': 'P1-high',
      'clarity': 'P2-medium',
      'suggestion': 'P3-low'
    };
    return priorities[type] || 'P3-low';
  }

  /**
   * 估計問題優先級 (基於問題內容)
   */
  estimatePriority(question) {
    const criticalKeywords = ['錯誤', '不對', '有誤', '錯'];
    const highKeywords = ['沒有', '應該', '應該'];
    const mediumKeywords = ['不清楚', '不明白'];

    const q = question.toLowerCase();

    if (criticalKeywords.some(k => q.includes(k))) return 'P0';
    if (highKeywords.some(k => q.includes(k))) return 'P1';
    if (mediumKeywords.some(k => q.includes(k))) return 'P2';

    return 'P3';
  }

  /**
   * 生成反饋報告
   */
  generateReport(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        summary: {
          total_submitted: 0,
          unique: 0,
          duplicates_found: 0,
          deduplication_rate: '0%'
        },
        distribution: {
          total: 0,
          by_type: {},
          by_priority: {},
          duplicates: 0,
          high_frequency: []
        },
        top_issues: [],
        recommendations: []
      };
    }

    const dedup = this.deduplicateFeedbacks(feedbacks);
    const stats = this.analyzeDistribution(dedup);

    const totalDuplicates = feedbacks.length - dedup.length;
    const dedupRate = feedbacks.length > 0 
      ? ((totalDuplicates / feedbacks.length) * 100).toFixed(1) 
      : '0';

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_submitted: feedbacks.length,
        unique: dedup.length,
        duplicates_found: totalDuplicates,
        deduplication_rate: dedupRate + '%'
      },
      distribution: stats,
      top_issues: stats.high_frequency.slice(0, 10),
      recommendations: this.generateRecommendations(stats, feedbacks.length)
    };

    return report;
  }

  /**
   * 生成改進建議
   */
  generateRecommendations(stats, totalFeedbacks = 0) {
    const recommendations = [];

    // P0 問題
    const p0Count = stats.by_priority['P0-critical'] || 0;
    if (p0Count > 0) {
      recommendations.push({
        type: 'urgent',
        message: `有 ${p0Count} 個緊急誤答問題，建議 24 小時內處理`
      });
    }

    // 高頻問題
    if (stats.high_frequency.length > 0) {
      const topIssue = stats.high_frequency[0];
      recommendations.push({
        type: 'high-frequency',
        message: `"${topIssue.question}" 被 ${topIssue.count} 人反饋，建議優先補充規則或改進答案`
      });
    }

    // 重複率高
    if (totalFeedbacks > 0 && stats.duplicates > totalFeedbacks * 0.2) {
      recommendations.push({
        type: 'deduplication',
        message: `重複率 > 20%，可能需要改進反饋過濾或自動回答機制`
      });
    }

    return recommendations;
  }

  /**
   * 批量驗證反饋質量
   */
  validateFeedbacks(feedbacks) {
    const validation = [];

    for (let i = 0; i < feedbacks.length; i++) {
      const feedback = feedbacks[i];
      const issues = [];

      // 檢查必填欄位
      if (!feedback.type) issues.push('缺少反饋類型');
      if (!feedback.question || feedback.question.trim().length === 0) issues.push('問題為空');
      if (!feedback.issue || feedback.issue.trim().length === 0) issues.push('反饋內容為空');

      // 檢查長度
      const questionLen = (feedback.question || '').length;
      const issueLen = (feedback.issue || '').length;
      
      if (questionLen > 0 && questionLen < 3) issues.push('問題太短 (< 3 字)');
      if (questionLen > 200) issues.push('問題太長 (> 200 字)');
      if (issueLen > 0 && issueLen < 10) issues.push('描述太短 (< 10 字)');
      if (issueLen > 2000) issues.push('描述太長 (> 2000 字)');

      // 檢查時間戳
      if (!feedback.timestamp) issues.push('缺少時間戳');

      validation.push({
        index: i,
        feedback: feedback,
        isValid: issues.length === 0,
        issues: issues
      });
    }

    return validation;
  }

  /**
   * 過濾有效反饋
   */
  filterValidFeedbacks(feedbacks) {
    const validation = this.validateFeedbacks(feedbacks);
    return validation
      .filter(v => v.isValid)
      .map(v => v.feedback);
  }
}

// 導出為 Node.js 模塊
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackProcessor;
}
