const Router = require('koa-router');
const router = new Router();

// Health check endpoint
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'OK',
    timestamp: new Date().toISOString()
  };
});

// Welcome endpoint
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Welcome to Koa Workers OpenAI API',
    version: '1.0.0'
  };
});

// Example API endpoint
router.post('/api/process', async (ctx) => {
  const { data } = ctx.request.body;

  if (!data) {
    ctx.status = 400;
    ctx.body = { error: 'Missing data parameter' };
    return;
  }

  ctx.body = {
    success: true,
    processedData: data,
    timestamp: new Date().toISOString()
  };
});

module.exports = router;
