const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const { ApolloServer } = require('@apollo/server');
const { koaMiddleware } = require('@as-integrations/koa');
const router = require('./routes');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
require('dotenv').config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

// CORS 支持 - 允许前端 React 应用访问
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Middleware
app.use(bodyParser());

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message
    };
    console.error('Error:', err);
  }
});

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// 初始化并启动服务器
async function startServer() {
  // 创建 Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
  });

  await apolloServer.start();

  // 将 Apollo Server 集成到 Koa
  app.use(
    koaMiddleware(apolloServer, {
      context: async ({ ctx }) => ({
        ctx,
      }),
    })
  );

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
