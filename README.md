# Koa Workers OpenAI

一个集成了 OpenAI API 和 GraphQL 的 Koa.js 后端项目，支持与 React 前端进行高效的数据交互。

## 功能特性

- ✅ **Koa.js** - 轻量级、高性能的 Node.js Web 框架
- ✅ **OpenAI 集成** - 支持 GPT 聊天、文本补全、图片生成等功能
- ✅ **GraphQL API** - 使用 Apollo Server 提供类型安全的 API
- ✅ **CORS 支持** - 配置跨域访问，支持前端 React 应用
- ✅ **环境变量配置** - 使用 dotenv 管理配置
- ✅ **错误处理** - 完善的错误处理和日志记录

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:3001
```

### 3. 启动服务

开发模式（支持热重载）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务器将启动在 `http://localhost:3000`

## GraphQL API

### GraphQL Playground

访问 `http://localhost:3000/graphql` 可以使用 GraphQL Playground 进行 API 测试。

### 查询 (Queries)

#### 健康检查

```graphql
query {
  health {
    status
    timestamp
  }
}
```

#### 欢迎信息

```graphql
query {
  welcome {
    message
    version
  }
}
```

### 变更 (Mutations)

#### 1. AI 聊天

```graphql
mutation {
  chat(
    input: {
      messages: [
        { role: "system", content: "你是一个友好的助手" }
        { role: "user", content: "你好，请介绍一下自己" }
      ]
      model: "gpt-3.5-turbo"
    }
  ) {
    success
    message
    data {
      reply
      model
      timestamp
    }
  }
}
```

#### 2. 文本补全

```graphql
mutation {
  completion(prompt: "写一首关于春天的诗") {
    success
    message
    data {
      text
      timestamp
    }
  }
}
```

#### 3. AI 图片生成

```graphql
mutation {
  generateImage(
    input: {
      prompt: "a beautiful sunset over the ocean"
      n: 1
      size: "1024x1024"
    }
  ) {
    success
    message
    data {
      urls
      timestamp
    }
  }
}
```

## REST API 端点

- `GET /` - 欢迎信息
- `GET /health` - 健康检查
- `POST /api/process` - 示例处理接口

## 部署到 Cloudflare Workers

本项目支持部署到 Cloudflare Workers，享受全球边缘网络的超低延迟。

### 快速部署

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npx wrangler login

# 3. 设置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY

# 4. 部署
npm run workers:deploy
```

### 本地开发测试

```bash
# 创建本地环境变量文件
cp .dev.vars.example .dev.vars

# 编辑 .dev.vars，添加你的 OpenAI API Key
# 然后启动本地开发服务器
npm run workers:dev
```

服务将在 `http://localhost:8787` 启动。

### 详细部署文档

查看 [CLOUDFLARE_WORKERS_DEPLOY.md](CLOUDFLARE_WORKERS_DEPLOY.md) 获取完整的部署指南，包括：
- 环境配置
- 自定义域名
- 监控和日志
- 成本估算
- 故障排除

### Workers 特性

- ⚡ 全球 300+ 个城市的边缘节点
- 💰 每天 100,000 次免费请求
- 🚀 自动扩展，无需服务器管理
- 🔒 内置安全防护

## React 前端集成

### 安装 Apollo Client

在你的 React 项目中安装依赖：

```bash
npm install @apollo/client graphql
```

### 示例代码

查看 [examples/react-client-example.jsx](examples/react-client-example.jsx) 获取完整的 React 集成示例。

基础设置：

```jsx
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      {/* 你的组件 */}
    </ApolloProvider>
  );
}
```

使用查询：

```jsx
import { useQuery, gql } from '@apollo/client';

const HEALTH_QUERY = gql`
  query {
    health {
      status
      timestamp
    }
  }
`;

function HealthCheck() {
  const { loading, error, data } = useQuery(HEALTH_QUERY);
  // ... 处理数据
}
```

## 项目结构

```
koa-workers-openai/
├── src/
│   ├── index.js              # 应用入口
│   ├── routes/
│   │   └── index.js          # REST API 路由
│   ├── graphql/
│   │   ├── schema.js         # GraphQL Schema 定义
│   │   └── resolvers.js      # GraphQL Resolvers
│   └── services/
│       └── openai.js         # OpenAI 服务封装
├── examples/
│   └── react-client-example.jsx  # React 客户端示例
├── .env.example              # 环境变量模板
├── .gitignore
├── package.json
└── README.md
```

## OpenAI 服务

项目封装了以下 OpenAI API 功能：

- **chat(messages, model)** - GPT 聊天对话
- **completion(prompt, model)** - 文本补全
- **createEmbedding(text)** - 文本向量化
- **generateImage(prompt, n, size)** - AI 图片生成

## 开发指南

### 添加新的 GraphQL 类型

1. 在 `src/graphql/schema.js` 中定义新类型
2. 在 `src/graphql/resolvers.js` 中实现对应的 resolver
3. 可选：在 `src/services/` 中添加业务逻辑

### 添加新的 REST 端点

在 `src/routes/index.js` 中添加新路由。

## 常见问题

### Q: 如何获取 OpenAI API Key？

1. 访问 [OpenAI Platform](https://platform.openai.com/) 并注册账户
2. 登录后前往 [API Keys 页面](https://platform.openai.com/api-keys)
3. 点击 "Create new secret key" 创建新的 API Key
4. 复制生成的 Key（只会显示一次！）
5. 将 Key 添加到项目的 `.env` 文件中

**注意**：
- 新用户有 $5 免费额度（有效期 3 个月）
- 可在 [Usage 页面](https://platform.openai.com/usage) 查看使用情况
- 建议设置使用限额避免意外费用
- 不要将 API Key 提交到 Git 或公开分享

### Q: GraphQL Playground 无法访问？

确保服务器已启动并检查 PORT 配置是否正确。

### Q: CORS 错误？

在 `.env` 文件中配置 `CORS_ORIGIN` 为你的前端地址。

## License

ISC
