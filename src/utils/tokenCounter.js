/**
 * Token 计数工具
 * 用于估算 OpenAI API 调用的 token 使用量
 */

// 简单的 token 估算（不需要额外依赖）
class TokenCounter {
  /**
   * 估算文本的 token 数量
   * 简单规则：英文约 4 字符/token，中文约 1.5 字符/token
   * @param {string} text - 要计算的文本
   * @returns {number} - 估算的 token 数
   */
  static estimate(text) {
    if (!text) return 0;

    // 分离中英文
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    // 估算：中文 1.5 字符/token，其他 4 字符/token
    const chineseTokens = Math.ceil(chineseChars / 1.5);
    const otherTokens = Math.ceil(otherChars / 4);

    return chineseTokens + otherTokens;
  }

  /**
   * 估算消息数组的总 token 数
   * @param {Array} messages - 消息数组
   * @returns {number} - 总 token 数
   */
  static estimateMessages(messages) {
    let total = 0;

    for (const message of messages) {
      // 每条消息的固定开销（约 4 tokens）
      total += 4;

      // 角色名称
      if (message.role) {
        total += this.estimate(message.role);
      }

      // 内容
      if (message.content) {
        total += this.estimate(message.content);
      }
    }

    // 回复的固定开销
    total += 3;

    return total;
  }

  /**
   * 计算预估费用（美元）
   * @param {number} tokens - token 数量
   * @param {string} model - 模型名称
   * @returns {object} - { input: 费用, output: 费用 }
   */
  static estimateCost(tokens, model = 'gpt-3.5-turbo') {
    // 价格（每 1000 tokens）- 2024 年价格
    const pricing = {
      'gpt-3.5-turbo': {
        input: 0.0005,   // $0.0005 / 1K tokens
        output: 0.0015,  // $0.0015 / 1K tokens
      },
      'gpt-4': {
        input: 0.03,     // $0.03 / 1K tokens
        output: 0.06,    // $0.06 / 1K tokens
      },
      'gpt-4-turbo': {
        input: 0.01,     // $0.01 / 1K tokens
        output: 0.03,    // $0.03 / 1K tokens
      },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];

    return {
      input: (tokens / 1000) * modelPricing.input,
      output: (tokens / 1000) * modelPricing.output,
      total: (tokens / 1000) * (modelPricing.input + modelPricing.output),
    };
  }

  /**
   * 格式化显示 token 信息
   * @param {number} tokens - token 数量
   * @param {string} model - 模型名称
   * @returns {string} - 格式化的字符串
   */
  static format(tokens, model = 'gpt-3.5-turbo') {
    const cost = this.estimateCost(tokens, model);
    return `Tokens: ${tokens} | Estimated Cost: $${cost.total.toFixed(6)}`;
  }
}

module.exports = TokenCounter;
