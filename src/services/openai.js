// 第1行：单独加载 dotenv，不赋值给变量（避免因赋值异常导致后续代码不执行）
require('dotenv').config();

// 第2行：立即打印验证日志（确认 dotenv 是否执行）
console.log('=== 紧急验证：dotenv 是否执行 ===');
console.log('process.env 是否存在？', !!process.env);
console.log('OPENAI_API_KEY 是否有值？', !!process.env.OPENAI_API_KEY);
console.log('================================');

// 第3行：导入 OpenAI（必须在 dotenv 之后）
const { OpenAI } = require('openai');

// 第4行：定义类（确保构造函数在 dotenv 之后执行）
class OpenAIService {
  constructor() {
    console.log('构造函数中：OPENAI_API_KEY =', process.env.OPENAI_API_KEY);
    // 第5行：初始化 OpenAI（此时 dotenv 已加载）
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

    /**
   * 生成聊天回复
   * @param {Array} messages - 聊天消息数组
   * @param {string} model - 使用的模型，默认为 gpt-3.5-turbo
   * @returns {Promise<string>} - AI 生成的回复
   */
  async chat(messages, model = 'gpt-3.5-turbo') {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API 调用失败: ${error.message}`);
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
      const completion = await this.client.completions.create({
        model,
        prompt,
        max_tokens: 1000,
      });

      return completion.choices[0].text;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API 调用失败: ${error.message}`);
    }
  }

    /**
   * 生成文本嵌入向量
   * @param {string} text - 要嵌入的文本
   * @returns {Promise<Array>} - 嵌入向量
   */
  async createEmbedding(text) {
    try {
      const embedding = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return embedding.data[0].embedding;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API 调用失败: ${error.message}`);
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
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        n,
        size,
      });

      return response.data.map(img => img.url);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API 调用失败: ${error.message}`);
    }
  }

}

// 关键：检查是否有“提前实例化”代码（如第94行的 new OpenAIService()）
// 若有，必须确保在类定义之后，且 dotenv 已加载
// 示例（若第94行有实例化，需放在类定义后）：
// const openaiService = new OpenAIService(); // 必须在 class OpenAIService 之后

// 导出类（最后执行）
module.exports = new OpenAIService()