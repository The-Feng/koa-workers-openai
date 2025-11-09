/**
 * Cloudflare Workers 入口文件
 * 处理所有传入的 HTTP 请求
 */
require('dotenv').config()

import { createApolloServer } from './graphql/handler.js';
import OpenAIService from './services/openai.js';

// CORS 响应头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * 处理 CORS 预检请求
 */
function handleCORS() {
  return new Response(null, {
    headers: CORS_HEADERS,
  });
}

/**
 * JSON 响应辅助函数
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * 路由处理
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 健康检查
  if (path === '/health' && request.method === 'GET') {
    return jsonResponse({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  }

  // 欢迎页面
  if (path === '/' && request.method === 'GET') {
    return jsonResponse({
      message: 'Welcome to Koa Workers OpenAI API on Cloudflare Workers',
      version: '1.0.0',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
      },
    });
  }

  // GraphQL 端点
  if (path === '/graphql') {
    console.log("process: ", process.env)
    // 检查 OpenAI API Key
    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { error: 'OPENAI_API_KEY not configured' },
        500
      );
    }

    try {
      const apolloServer = await createApolloServer(env.OPENAI_API_KEY);

      // 处理 GraphQL 请求
      const response = await apolloServer.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          method: request.method,
          headers: request.headers,
          body:
            request.method === 'POST'
              ? await request.json()
              : undefined,
          search: url.search,
        },
        context: async () => ({
          env,
        }),
      });

      // 构建响应
      if (response.body.kind === 'complete') {
        return new Response(response.body.string, {
          status: response.status || 200,
          headers: {
            ...Object.fromEntries(response.headers),
            ...CORS_HEADERS,
          },
        });
      }

      // 流式响应（如果有的话）
      const { readable, writable } = new TransformStream();
      response.body.asyncIterator.pipeTo(writable);
      return new Response(readable, {
        status: response.status || 200,
        headers: {
          ...Object.fromEntries(response.headers),
          ...CORS_HEADERS,
        },
      });
    } catch (error) {
      console.error('GraphQL Error:', error);
      return jsonResponse(
        {
          error: 'GraphQL processing failed',
          message: error.message,
        },
        500
      );
    }
  }

  // REST API - 聊天示例
  if (path === '/api/chat' && request.method === 'POST') {
    try {
      const { messages, model } = await request.json();

      if (!env.OPENAI_API_KEY) {
        return jsonResponse({ error: 'OPENAI_API_KEY not configured' }, 500);
      }

      const openaiService = new OpenAIService(env.OPENAI_API_KEY);
      const reply = await openaiService.chat(messages, model);

      return jsonResponse({
        success: true,
        data: {
          reply,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          error: error.message,
        },
        500
      );
    }
  }

  // 404 处理
  return jsonResponse(
    {
      error: 'Not Found',
      path,
    },
    404
  );
}

/**
 * Workers 主入口
 */
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Worker Error:', error);
      return jsonResponse(
        {
          error: 'Internal Server Error',
          message: error.message,
        },
        500
      );
    }
  },
};
