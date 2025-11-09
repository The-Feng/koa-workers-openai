/**
 * Cloudflare Workers 版本的 OpenAI 服务
 * 使用标准 fetch API，兼容 Workers 运行时
 */

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  /**
   * 发送请求到 OpenAI API
   */
  async request(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API 请求失败');
    }

    return response.json();
  }

  /**
   * 生成聊天回复
   * @param {Array} messages - 聊天消息数组
   * @param {string} model - 使用的模型，默认为 gpt-3.5-turbo
   * @returns {Promise<string>} - AI 生成的回复
   */
  async chat(messages, model = 'gpt-3.5-turbo') {
    try {
      const data = await this.request('/chat/completions', {
        model,
        messages,
      });

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      throw error;
    }
  }

  /**
   * 生成文本补全
   * @param {string} prompt - 提示文本
   * @param {string} model - 使用的模型
   * @returns {Promise<string>} - AI 生成的文本
   */
  async completion(prompt, model = 'gpt-3.5-turbo-instruct') {
    try {
      const data = await this.request('/completions', {
        model,
        prompt,
        max_tokens: 1000,
      });

      return data.choices[0].text;
    } catch (error) {
      console.error('OpenAI Completion Error:', error);
      throw error;
    }
  }

  /**
   * 生成文本嵌入向量
   * @param {string} text - 要嵌入的文本
   * @returns {Promise<Array>} - 嵌入向量
   */
  async createEmbedding(text) {
    try {
      const data = await this.request('/embeddings', {
        model: 'text-embedding-ada-002',
        input: text,
      });

      return data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embedding Error:', error);
      throw error;
    }
  }

  /**
   * 生成图片
   * @param {string} prompt - 图片描述
   * @param {number} n - 生成图片数量
   * @param {string} size - 图片尺寸
   * @returns {Promise<Array>} - 图片 URL 数组
   */
  async generateImage(prompt, n = 1, size = '1024x1024') {
    try {
      const data = await this.request('/images/generations', {
        model: 'dall-e-3',
        prompt,
        n,
        size,
      });

      return data.data.map(img => img.url);
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error);
      throw error;
    }
  }
}

export default OpenAIService;
