# 快速入门指南

选择你的部署方式：

## 方式 1: 本地 Node.js 开发

适合本地开发和测试。

### 步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，添加你的 OpenAI API Key

# 3. 启动开发服务器
npm run dev
```

访问：
- http://localhost:3000 - 欢迎页面
- http://localhost:3000/graphql - GraphQL API
- http://localhost:3000/health - 健康检查

---

## 方式 2: Cloudflare Workers 部署

适合生产环境，全球边缘网络，超低延迟。

### 步骤

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare（首次使用）
npx wrangler login

# 3. 本地测试（可选）
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，添加你的 OpenAI API Key
npm run workers:dev
# 访问 http://localhost:8787

# 4. 设置生产环境密钥
npx wrangler secret put OPENAI_API_KEY
# 输入你的 OpenAI API Key

# 5. 部署到生产环境
npm run workers:deploy
```

部署成功后会得到一个 URL，例如：
```
https://koa-workers-openai.your-subdomain.workers.dev
```

---

## 获取 OpenAI API Key

1. 访问 https://platform.openai.com/
2. 注册/登录账户
3. 前往 https://platform.openai.com/api-keys
4. 点击 "Create new secret key"
5. 复制生成的 Key（只显示一次！）

---

## 测试 API

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:3000/health

# GraphQL 查询
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { health { status timestamp } }"
  }'

# AI 聊天
curl -X POST http://localhost:3000/graphql \
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

### 在 React 中使用

```bash
# 在你的 React 项目中安装
npm install @apollo/client graphql
```

```jsx
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useMutation } from '@apollo/client';

// 创建客户端
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',  // 或你的 Workers URL
  cache: new InMemoryCache(),
});

// 在组件中使用
const CHAT_MUTATION = gql`
  mutation Chat($input: ChatInput!) {
    chat(input: $input) {
      success
      data { reply }
    }
  }
`;

function ChatComponent() {
  const [chat] = useMutation(CHAT_MUTATION);

  const sendMessage = async () => {
    const result = await chat({
      variables: {
        input: {
          messages: [{ role: 'user', content: 'Hello!' }]
        }
      }
    });
    console.log(result.data.chat.data.reply);
  };

  return <button onClick={sendMessage}>发送</button>;
}

// 包裹你的应用
function App() {
  return (
    <ApolloProvider client={client}>
      <ChatComponent />
    </ApolloProvider>
  );
}
```

---

## 下一步

- 📖 查看 [README.md](README.md) 了解完整功能
- 🚀 查看 [CLOUDFLARE_WORKERS_DEPLOY.md](CLOUDFLARE_WORKERS_DEPLOY.md) 了解部署详情
- 💻 查看 [examples/react-client-example.jsx](examples/react-client-example.jsx) 了解 React 集成示例

---

## 常见问题

**Q: 本地开发时 GraphQL 报错？**
A: 确保已经正确配置 `.env` 文件，并重启服务器。

**Q: Workers 部署失败？**
A: 运行 `npx wrangler whoami` 确认已登录，并检查 `wrangler.toml` 配置。

**Q: OpenAI API 调用失败？**
A: 检查 API Key 是否正确，是否有可用额度，在 https://platform.openai.com/usage 查看。

**Q: 如何限制 API 使用？**
A: 在 OpenAI 控制台设置使用限额，或在代码中添加身份验证和限流逻辑。

---

需要帮助？查看 [Issues](https://github.com/yourusername/koa-workers-openai/issues) 或查阅文档。
