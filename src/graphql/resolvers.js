const openaiService = require('../services/openai');

const resolvers = {
  Query: {
    /**
     * 健康检查
     */
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),

    /**
     * 欢迎信息
     */
    welcome: () => ({
      message: 'Welcome to Koa Workers OpenAI GraphQL API',
      version: '1.0.0',
    }),
  },

  Mutation: {
    /**
     * 聊天接口
     */
    chat: async (_, { input }) => {
      try {
        const { messages, model } = input;

        // 转换消息格式
        const formattedMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const reply = await openaiService.chat(formattedMessages, model);

        return {
          success: true,
          message: '聊天成功',
          data: {
            reply,
            model: model || 'gpt-3.5-turbo',
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error('Chat error:', error);
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    /**
     * 文本补全接口
     */
    completion: async (_, { prompt }) => {
      try {
        const text = await openaiService.completion(prompt);

        return {
          success: true,
          message: '文本生成成功',
          data: {
            text,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error('Completion error:', error);
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    /**
     * 生成图片接口
     */
    generateImage: async (_, { input }) => {
      try {
        const { prompt, n = 1, size = '1024x1024' } = input;

        const urls = await openaiService.generateImage(prompt, n, size);

        return {
          success: true,
          message: '图片生成成功',
          data: {
            urls,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error('Image generation error:', error);
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },
  },
};

module.exports = resolvers;
