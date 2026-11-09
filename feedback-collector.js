/**
 * 反饋收集模塊 (Feedback Collector)
 * 用途: 在前端收集用戶反饋，存儲到 localStorage，待同步到 GitHub
 * 
 * 使用方法:
 *   const collector = new FeedbackCollector();
 *   collector.init(); // 在 DOMContentLoaded 後調用
 *   collector.submitFeedback('error', '問題描述');
 */

class FeedbackCollector {
  constructor() {
    this.storageKey = 'feedback_queue';
    this.sessionId = this.generateSessionId();
    this.feedbackQueue = [];
    this.maxQueueSize = 100; // 最多存 100 條待同步反饋
  }

  /**
   * 初始化反饋系統
   */
  init() {
    this.loadQueue();
    this.injectFeedbackUI();
    this.attachEventListeners();
    console.log(`[反饋系統] 已初始化 (SessionID: ${this.sessionId.substring(0, 8)}...)`);
  }

  /**
   * 生成匿名 Session ID
   */
  generateSessionId() {
    const stored = localStorage.getItem('session_id');
    if (stored) return stored;
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('session_id', sessionId);
    return sessionId;
  }

  /**
   * 注入反饋 UI (漂浮按鈕 + 表單)
   */
  injectFeedbackUI() {
    const html = `
<div id="feedback-fab" class="feedback-fab" title="提交反饋">
  <span class="feedback-fab-icon">💬</span>
</div>

<div id="feedback-modal" class="feedback-modal hidden">
  <div class="feedback-modal-content">
    <div class="feedback-modal-header">
      <h3>您的反饋幫助我們改進</h3>
      <button class="feedback-close-btn">✕</button>
    </div>
    
    <form id="feedback-form" class="feedback-form">
      <div class="feedback-form-group">
        <label for="feedback-type">反饋類型 *</label>
        <select id="feedback-type" name="type" required>
          <option value="">-- 選擇反饋類型 --</option>
          <option value="error">❌ 這個答案有誤/不相關</option>
          <option value="missing">⚠️ 應該回答這個問題，但沒有</option>
          <option value="clarity">📝 用詞不夠清楚/易誤解</option>
          <option value="suggestion">💡 改進建議或功能要求</option>
        </select>
      </div>

      <div class="feedback-form-group">
        <label for="feedback-question">您提出的問題 *</label>
        <input type="text" id="feedback-question" name="question" 
               placeholder="例：改選後多久要做帳" required>
      </div>

      <div class="feedback-form-group">
        <label for="feedback-answer">系統給出的答案</label>
        <input type="text" id="feedback-answer" name="answer_title" 
               placeholder="（系統自動填入，可編輯）">
      </div>

      <div class="feedback-form-group">
        <label for="feedback-issue">具體描述 *</label>
        <textarea id="feedback-issue" name="issue" 
                  placeholder="例：答案說是三個月，但根據辦法第11條應該是一個月..." 
                  required rows="4"></textarea>
      </div>

      <div class="feedback-form-info">
        <small>✓ 完全匿名，不收集個人資訊  |  反饋資料用於改進系統</small>
      </div>

      <div class="feedback-form-actions">
        <button type="submit" class="feedback-btn-submit">提交反饋</button>
        <button type="reset" class="feedback-btn-cancel">取消</button>
      </div>

      <div id="feedback-status" class="feedback-status hidden"></div>
    </form>
  </div>
</div>

<style>
  /* 漂浮按鈕 */
  .feedback-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .feedback-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }

  /* 模態框 */
  .feedback-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
  }

  .feedback-modal.hidden {
    display: none;
  }

  .feedback-modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .feedback-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  .feedback-modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  .feedback-close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
  }

  .feedback-close-btn:hover {
    color: #333;
  }

  /* 表單 */
  .feedback-form {
    padding: 20px;
  }

  .feedback-form-group {
    margin-bottom: 16px;
  }

  .feedback-form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .feedback-form-group input,
  .feedback-form-group select,
  .feedback-form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
  }

  .feedback-form-group input:focus,
  .feedback-form-group select:focus,
  .feedback-form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .feedback-form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .feedback-form-info {
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-bottom: 16px;
  }

  .feedback-form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .feedback-btn-submit,
  .feedback-btn-cancel {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .feedback-btn-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .feedback-btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .feedback-btn-cancel {
    background: #f0f0f0;
    color: #666;
  }

  .feedback-btn-cancel:hover {
    background: #e0e0e0;
  }

  .feedback-status {
    margin-top: 12px;
    padding: 12px;
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
  }

  .feedback-status.success {
    background: #d4edda;
    color: #155724;
  }

  .feedback-status.error {
    background: #f8d7da;
    color: #721c24;
  }

  .feedback-status.hidden {
    display: none;
  }
</style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  /**
   * 綁定事件監聽
   */
  attachEventListeners() {
    const fab = document.getElementById('feedback-fab');
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.querySelector('.feedback-close-btn');
    const form = document.getElementById('feedback-form');
    const cancelBtn = document.querySelector('.feedback-btn-cancel');

    // 打開表單
    fab.addEventListener('click', () => {
      modal.classList.remove('hidden');
      // 自動填入當前答案（如果存在）
      this.prefillCurrentAnswer();
    });

    // 關閉表單
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    // 提交表單
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitFormData(form);
    });
  }

  /**
   * 自動填入當前答案（如果有顯示的答案）
   */
  prefillCurrentAnswer() {
    const answerTitle = document.querySelector('.answer-title');
    if (answerTitle) {
      document.getElementById('feedback-answer').value = answerTitle.textContent.substring(0, 100);
    }
  }

  /**
   * 提交表單數據
   */
  submitFormData(form) {
    const formData = new FormData(form);
    const feedback = {
      type: formData.get('type'),
      question: formData.get('question'),
      answer_title: formData.get('answer_title'),
      issue: formData.get('issue'),
      timestamp: new Date().toISOString(),
      user_session: this.sessionId,
      user_agent: navigator.userAgent.substring(0, 100)
    };

    // 驗證
    if (!feedback.type || !feedback.question || !feedback.issue) {
      this.showStatus('error', '請填寫所有必填欄位');
      return;
    }

    // 添加到隊列
    this.addFeedback(feedback);
    this.showStatus('success', '感謝您的反饋！我們會盡快檢查并改進。');

    // 清空表單
    form.reset();

    // 3 秒後關閉表單
    setTimeout(() => {
      document.getElementById('feedback-modal').classList.add('hidden');
      this.clearStatus();
    }, 2000);
  }

  /**
   * 添加反饋到隊列
   */
  addFeedback(feedback) {
    this.feedbackQueue.push(feedback);
    
    // 限制隊列大小
    if (this.feedbackQueue.length > this.maxQueueSize) {
      this.feedbackQueue.shift();
    }

    this.saveQueue();
  }

  /**
   * 保存隊列到 localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.feedbackQueue));
    } catch (e) {
      console.error('[反饋系統] 保存失敗:', e);
    }
  }

  /**
   * 加載隊列從 localStorage
   */
  loadQueue() {
    try {
      const data = localStorage.getItem(this.storageKey);
      this.feedbackQueue = data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[反饋系統] 加載失敗:', e);
      this.feedbackQueue = [];
    }
  }

  /**
   * 顯示狀態消息
   */
  showStatus(type, message) {
    const status = document.getElementById('feedback-status');
    status.textContent = message;
    status.className = `feedback-status ${type}`;
  }

  /**
   * 清空狀態消息
   */
  clearStatus() {
    const status = document.getElementById('feedback-status');
    status.classList.add('hidden');
  }

  /**
   * 獲取待同步反饋
   */
  getPendingFeedback() {
    return this.feedbackQueue;
  }

  /**
   * 清空隊列（同步成功後調用）
   */
  clearQueue() {
    this.feedbackQueue = [];
    this.saveQueue();
  }
}

// 自動初始化（在 DOMContentLoaded 後）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.feedbackCollector) {
      window.feedbackCollector = new FeedbackCollector();
      window.feedbackCollector.init();
    }
  });
} else {
  if (!window.feedbackCollector) {
    window.feedbackCollector = new FeedbackCollector();
    window.feedbackCollector.init();
  }
}
