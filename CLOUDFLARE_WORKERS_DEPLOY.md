# Cloudflare Workers 部署指南

本指南将帮助你将项目部署到 Cloudflare Workers。

## 为什么选择 Cloudflare Workers？

- ⚡ **全球边缘网络** - 在全球 300+ 个城市部署，超低延迟
- 💰 **免费额度** - 每天 100,000 次请求免费
- 🚀 **无服务器** - 无需管理服务器，自动扩展
- 🔒 **安全可靠** - 内置 DDoS 防护和安全隔离

## 前置要求

1. [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（免费）
2. Node.js 16.13.0 或更高版本
3. npm 或 yarn 包管理器

## 步骤 1: 安装 Wrangler CLI

Wrangler 是 Cloudflare Workers 的官方 CLI 工具。

```bash
npm install
```

Wrangler 已经作为开发依赖添加到项目中。

## 步骤 2: 登录 Cloudflare

```bash
npx wrangler login
```

这将打开浏览器窗口，要求你授权 Wrangler 访问你的 Cloudflare 账户。

## 步骤 3: 配置项目

编辑 `wrangler.toml` 文件，添加你的账户 ID：

```toml
name = "koa-workers-openai"
main = "worker/index.js"
compatibility_date = "2024-01-01"

# 添加你的账户 ID（可选，但推荐）
account_id = "your-account-id-here"
```

你可以在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 的右侧找到你的 Account ID。

## 步骤 4: 设置环境变量

Cloudflare Workers 使用 secrets 来存储敏感信息（如 API Keys）。

### 设置 OpenAI API Key

```bash
npx wrangler secret put OPENAI_API_KEY
```

运行后会提示你输入 API Key。输入后按回车确认。

### 查看已设置的 secrets

```bash
npx wrangler secret list
```

## 步骤 5: 本地开发测试

在部署前，先在本地测试：

```bash
npm run workers:dev
```

这将启动本地开发服务器，通常在 `http://localhost:8787`。

你可以访问：
- `http://localhost:8787/` - 欢迎页面
- `http://localhost:8787/health` - 健康检查
- `http://localhost:8787/graphql` - GraphQL API

**注意**：本地开发时，你需要在本地设置 `.dev.vars` 文件来提供环境变量：

创建 `.dev.vars` 文件（不要提交到 Git）：

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 步骤 6: 部署到 Cloudflare Workers

### 生产环境部署

```bash
npm run workers:deploy
```

部署成功后，你会看到类似输出：

```
Published koa-workers-openai (1.23 sec)
  https://koa-workers-openai.your-subdomain.workers.dev
```

### 查看部署的 Worker

访问 [Cloudflare Workers Dashboard](https://dash.cloudflare.com/?to=/:account/workers) 查看你的 Workers。

## 步骤 7: 测试部署

部署完成后，测试你的 API：

### 测试健康检查

```bash
curl https://koa-workers-openai.your-subdomain.workers.dev/health
```

### 测试 GraphQL

```bash
curl -X POST https://koa-workers-openai.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { health { status timestamp } }"
  }'
```

### 测试 AI 聊天

```bash
curl -X POST https://koa-workers-openai.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($input: ChatInput!) { chat(input: $input) { success message data { reply } } }",
    "variables": {
      "input": {
        "messages": [
          {"role": "user", "content": "Hello!"}
        ]
      }
    }
  }'
```

## 监控和日志

### 实时查看日志

```bash
npm run workers:tail
```

这会实时显示你的 Worker 的日志输出。

### 查看使用情况

访问 [Workers Analytics](https://dash.cloudflare.com/?to=/:account/workers/analytics) 查看：
- 请求数量
- 错误率
- CPU 使用时间
- 等等

## 自定义域名（可选）

你可以为你的 Worker 配置自定义域名：

1. 在 Cloudflare 上添加你的域名
2. 在 Worker 设置中添加路由（Routes）
3. 或使用 `wrangler.toml` 配置：

```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## 更新 React 前端配置

部署完成后，更新你的 React 应用中的 GraphQL 端点：

```jsx
const client = new ApolloClient({
  uri: 'https://koa-workers-openai.your-subdomain.workers.dev/graphql',
  cache: new InMemoryCache(),
});
```

## 环境管理

### 开发环境

在 `wrangler.toml` 中可以配置多个环境：

```toml
[env.staging]
name = "koa-workers-openai-staging"

[env.production]
name = "koa-workers-openai-production"
```

部署到特定环境：

```bash
npx wrangler deploy --env staging
npx wrangler deploy --env production
```

## 成本估算

Cloudflare Workers 免费计划：
- ✅ 每天 100,000 次请求
- ✅ 最多 10ms CPU 时间/请求
- ✅ 30 个 Workers

付费计划（$5/月）：
- ✅ 1000 万次请求/月
- ✅ 50ms CPU 时间/请求
- ✅ 无限 Workers
- ✅ 更多功能（Durable Objects, KV 等）

## 常见问题

### Q: 如何更新已部署的 Worker？

A: 运行 `npm run workers:deploy` 即可，新版本会自动替换旧版本。

### Q: 如何删除 Worker？

A: 使用命令 `npx wrangler delete` 或在 Dashboard 中删除。

### Q: Workers 有哪些限制？

A: 主要限制包括：
- CPU 时间限制（免费：10ms，付费：50ms）
- 内存限制：128MB
- 请求体大小：100MB
- 响应大小：无限制（但建议不超过 25MB）

### Q: 如何处理 CORS 错误？

A: Worker 代码已经包含 CORS 头处理。如果需要限制域名，修改 `worker/index.js` 中的 `CORS_HEADERS`。

### Q: OpenAI API 调用会超时吗？

A: Workers 没有总执行时间限制，只有 CPU 时间限制。网络请求（如调用 OpenAI API）不计入 CPU 时间。

### Q: 可以使用数据库吗？

A: Workers 本身不支持传统数据库，但可以使用：
- Cloudflare D1（SQLite）
- Cloudflare KV（键值存储）
- Cloudflare Durable Objects（状态存储）
- 外部数据库（通过 HTTP API）

## 高级功能

### 使用 KV 存储缓存

在 `wrangler.toml` 中添加：

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

创建 KV 命名空间：

```bash
npx wrangler kv:namespace create "CACHE"
```

### 使用 Durable Objects

适合需要持久化状态的场景（如聊天会话）：

```toml
[[durable_objects.bindings]]
name = "CHAT_SESSIONS"
class_name = "ChatSession"
```

## 资源链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Workers 示例](https://developers.cloudflare.com/workers/examples/)
- [定价信息](https://developers.cloudflare.com/workers/platform/pricing/)

## 故障排除

### 部署失败

1. 检查 `wrangler.toml` 配置是否正确
2. 确保已登录：`npx wrangler whoami`
3. 查看详细错误信息：`npx wrangler deploy --verbose`

### OpenAI API 错误

1. 确认已设置 secret：`npx wrangler secret list`
2. 检查 API Key 是否有效
3. 查看 Worker 日志：`npm run workers:tail`

### GraphQL 错误

1. 确认请求格式正确
2. 使用 GraphQL Playground 测试（本地开发时）
3. 检查 Worker 日志中的详细错误信息

## 下一步

- 🔐 添加身份验证（使用 Cloudflare Access 或 JWT）
- 📊 集成 Workers Analytics
- 💾 使用 KV 存储缓存响应
- 🎯 优化性能和成本
- 🔄 设置 CI/CD 自动部署

祝你部署顺利！🚀
