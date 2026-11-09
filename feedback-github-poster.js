/**
 * GitHub 反饋同步模塊 (Feedback GitHub Poster)
 * 用途: 定期檢查反饋隊列，自動開立 GitHub Issue
 * 
 * 環境變量要求:
 *   GITHUB_TOKEN - GitHub Personal Access Token (repo 權限)
 *   GITHUB_REPO - 倉庫 (格式: owner/repo)
 * 
 * 在 GitHub Actions 中調用:
 *   node feedback-github-poster.js --post-all
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FeedbackGitHubPoster {
  constructor(token, repo) {
    this.token = token;
    this.repo = repo;
    const [owner, repoName] = repo.split('/');
    this.owner = owner;
    this.repoName = repoName;
    this.feedbackFile = path.join(__dirname, 'feedback-queue.json');
    this.issueCacheFile = path.join(__dirname, 'feedback-issues-cache.json');
  }

  /**
   * 從檔案系統讀取反饋隊列（由前端持久化）
   */
  loadFeedbackQueue() {
    try {
      // 注：實際使用時，反饋隊列應由前端導出或通過 API 傳遞
      // 這裡僅作示例
      if (fs.existsSync(this.feedbackFile)) {
        const data = fs.readFileSync(this.feedbackFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('讀取反饋隊列失敗:', e);
    }
    return [];
  }

  /**
   * 開立 GitHub Issue
   */
  async postIssue(feedback) {
    const { type, question, answer_title, issue, timestamp, user_session } = feedback;

    const typeLabel = this.getTypeLabel(type);
    const priority = this.calculatePriority(type);

    const body = `
## 反饋詳情

**提問**: ${question}
**系統答案**: ${answer_title || '（無）'}

**反饋內容**:
${issue}

---

**反饋類型**: ${typeLabel}
**優先級**: ${priority}
**提交時間**: ${timestamp}
**Session ID**: \`${user_session}\`

*此 issue 由自動反饋系統生成*
    `.trim();

    const issueData = {
      title: `[反饋] ${typeLabel} - ${question.substring(0, 50)}`,
      body: body,
      labels: ['feedback', `type-${type}`, `priority-${priority}`]
    };

    try {
      const response = await this.makeRequest('POST', `/repos/${this.repo}/issues`, issueData);
      console.log(`✓ Issue #${response.number} 已開立: ${issueData.title}`);
      return response;
    } catch (error) {
      console.error('開立 Issue 失敗:', error);
      throw error;
    }
  }

  /**
   * 批量發佈反饋
   */
  async postAllPending() {
    const feedbackQueue = this.loadFeedbackQueue();
    
    if (feedbackQueue.length === 0) {
      console.log('沒有待發佈的反饋');
      return [];
    }

    console.log(`開始發佈 ${feedbackQueue.length} 條反饋...`);

    const results = [];
    for (const feedback of feedbackQueue) {
      try {
        const result = await this.postIssue(feedback);
        results.push({ success: true, feedback, issue: result });
      } catch (error) {
        results.push({ success: false, feedback, error: error.message });
      }
      
      // 避免 API 限流
      await this.sleep(500);
    }

    console.log(`完成：${results.filter(r => r.success).length}/${feedbackQueue.length}`);
    return results;
  }

  /**
   * 統計反饋數據
   */
  async generateWeeklyReport() {
    try {
      // 查詢過去 7 天的 feedback issues
      const query = `repo:${this.repo} label:feedback created:>=${this.getDateString(-7)}`;
      const response = await this.makeRequest('GET', `/search/issues?q=${encodeURIComponent(query)}`);
      
      const issues = response.items || [];
      const stats = {
        total: issues.length,
        by_type: {},
        by_priority: {},
        open_issues: 0,
        closed_issues: 0
      };

      for (const issue of issues) {
        const typeLabel = issue.labels
          .find(l => l.name.startsWith('type-'))
          ?.name.replace('type-', '') || 'unknown';
        const priority = issue.labels
          .find(l => l.name.startsWith('priority-'))
          ?.name.replace('priority-', '') || 'unknown';

        stats.by_type[typeLabel] = (stats.by_type[typeLabel] || 0) + 1;
        stats.by_priority[priority] = (stats.by_priority[priority] || 0) + 1;

        if (issue.state === 'open') stats.open_issues++;
        else stats.closed_issues++;
      }

      return stats;
    } catch (error) {
      console.error('生成報告失敗:', error);
      return null;
    }
  }

  /**
   * 發佈週報
   */
  async postWeeklyReport() {
    const report = await this.generateWeeklyReport();
    if (!report) return;

    const body = `
## 本週反饋統計

**統計期間**: 過去 7 天
**總反饋數**: ${report.total}

### 反饋類型分布
${Object.entries(report.by_type).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

### 優先級分布
${Object.entries(report.by_priority).map(([priority, count]) => `- ${priority}: ${count}`).join('\n')}

### 狀態
- 待處理: ${report.open_issues}
- 已解決: ${report.closed_issues}

---
*自動生成於 ${new Date().toISOString()}*
    `.trim();

    try {
      // 檢查是否已有本週報告
      const existing = await this.findExistingReport();
      if (existing) {
        // 更新現有報告
        await this.updateIssue(existing.number, { body });
        console.log(`✓ 週報 #${existing.number} 已更新`);
      } else {
        // 創建新報告
        const result = await this.makeRequest('POST', `/repos/${this.repo}/issues`, {
          title: `📊 反饋週報 - ${new Date().toISOString().split('T')[0]}`,
          body: body,
          labels: ['feedback', 'weekly-report']
        });
        console.log(`✓ 週報 #${result.number} 已發佈`);
      }
    } catch (error) {
      console.error('發佈週報失敗:', error);
    }
  }

  /**
   * 查找現有週報
   */
  async findExistingReport() {
    try {
      const query = `repo:${this.repo} label:weekly-report type:issue is:open created:${this.getDateString(-1)}`;
      const response = await this.makeRequest('GET', `/search/issues?q=${encodeURIComponent(query)}`);
      return response.items?.[0] || null;
    } catch (error) {
      console.error('查找週報失敗:', error);
      return null;
    }
  }

  /**
   * 更新 Issue
   */
  async updateIssue(issueNumber, data) {
    return await this.makeRequest('PATCH', `/repos/${this.repo}/issues/${issueNumber}`, data);
  }

  /**
   * 發送 HTTP 請求到 GitHub API
   */
  makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: path,
        method: method,
        headers: {
          'Authorization': `token ${this.token}`,
          'User-Agent': 'Feedback-System',
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 400) {
              reject(new Error(`GitHub API 錯誤 ${res.statusCode}: ${parsed.message}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`無法解析回應: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * 輔助方法
   */
  getTypeLabel(type) {
    const labels = {
      'error': '❌ 誤答',
      'missing': '⚠️ 漏洞',
      'clarity': '📝 表述',
      'suggestion': '💡 建議'
    };
    return labels[type] || type;
  }

  calculatePriority(type) {
    const priorities = {
      'error': 'P0-critical',
      'missing': 'P1-high',
      'clarity': 'P2-medium',
      'suggestion': 'P3-low'
    };
    return priorities[type] || 'P3-low';
  }

  getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI 命令行支持
if (require.main === module) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 't8661360-jpg/pingtung-civil-groups';

  if (!token) {
    console.error('❌ 環境變量 GITHUB_TOKEN 未設置');
    process.exit(1);
  }

  const poster = new FeedbackGitHubPoster(token, repo);
  const command = process.argv[2];

  (async () => {
    switch (command) {
      case '--post-all':
        await poster.postAllPending();
        break;
      case '--report':
        await poster.postWeeklyReport();
        break;
      default:
        console.log('用法:');
        console.log('  node feedback-github-poster.js --post-all   # 發佈所有待反饋');
        console.log('  node feedback-github-poster.js --report     # 發佈週報');
        process.exit(0);
    }
  })().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = FeedbackGitHubPoster;
