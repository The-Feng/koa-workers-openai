import { ApolloServer } from '@apollo/server';
import OpenAIService from '../services/openai.js';

// GraphQL Schema
const typeDefs = `
  type Query {
    health: HealthStatus!
    welcome: WelcomeMessage!
  }

  type Mutation {
    chat(input: ChatInput!): ChatResponse!
    completion(prompt: String!): CompletionResponse!
    generateImage(input: ImageGenerationInput!): ImageGenerationResponse!
  }

  input ChatInput {
    messages: [MessageInput!]!
    model: String
  }

  input MessageInput {
    role: String!
    content: String!
  }

  input ImageGenerationInput {
    prompt: String!
    n: Int
    size: String
  }

  type ChatResponse {
    success: Boolean!
    message: String!
    data: ChatData
  }

  type ChatData {
    reply: String!
    model: String!
    timestamp: String!
  }

  type CompletionResponse {
    success: Boolean!
    message: String!
    data: CompletionData
  }

  type CompletionData {
    text: String!
    timestamp: String!
  }

  type ImageGenerationResponse {
    success: Boolean!
    message: String!
    data: ImageData
  }

  type ImageData {
    urls: [String!]!
    timestamp: String!
  }

  type HealthStatus {
    status: String!
    timestamp: String!
  }

  type WelcomeMessage {
    message: String!
    version: String!
  }
`;

// GraphQL Resolvers
function createResolvers(openaiService) {
  return {
    Query: {
      health: () => ({
        status: 'OK',
        timestamp: new Date().toISOString(),
      }),
      welcome: () => ({
        message: 'Welcome to Koa Workers OpenAI GraphQL API',
        version: '1.0.0',
      }),
    },
    Mutation: {
      chat: async (_, { input }) => {
        try {
          const { messages, model } = input;
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
          return {
            success: false,
            message: error.message,
            data: null,
          };
        }
      },
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
          return {
            success: false,
            message: error.message,
            data: null,
          };
        }
      },
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
          return {
            success: false,
            message: error.message,
            data: null,
          };
        }
      },
    },
  };
}

// 创建 Apollo Server 实例
export async function createApolloServer(apiKey) {
  const openaiService = new OpenAIService(apiKey);
  const resolvers = createResolvers(openaiService);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await server.start();
  return server;
}
