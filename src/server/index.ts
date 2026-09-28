import Fastify from 'fastify';
import { registerReasoningRoutes } from './api/reasoningRoute.js';
import { registerMcpRoutes } from './api/mcpRoute.js';

const server = Fastify({ logger: true });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS middleware
server.addHook('onRequest', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    reply.code(200).send();
    return;
  }
  done();
});

// Root endpoint
server.get('/', async () => {
  return { 
    status: 'online', 
    service: 'RyanAI API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
});

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'online',
    service: 'ryanai-api-gateway',
    database: process.env.DATABASE_URL ? 'configured' : 'not-configured',
    redis: process.env.REDIS_URL ? 'configured' : 'not-configured',
    cudaDevice: process.env.CUDA_DEVICE_ID || '0',
    timestamp: new Date().toISOString()
  };
});

// Legacy reasoning endpoint
server.post('/api/reason', async (request) => {
  const body = request.body as { prompt?: string };
  return {
    success: true,
    engine: 'RyanAI LangGraph ReAct + CUDA',
    response: `Autonomous reasoning processed: "${body?.prompt || 'No prompt provided'}"`,
    timestamp: new Date().toISOString()
  };
});

// Register feature routes
async function setupRoutes() {
  try {
    await registerReasoningRoutes(server);
    console.log('✓ Reasoning routes registered');
  } catch (err) {
    console.error('Failed to register reasoning routes:', err);
  }

  try {
    await registerMcpRoutes(server);
    console.log('✓ MCP routes registered');
  } catch (err) {
    console.error('Failed to register MCP routes:', err);
  }
}

// Start server
async function startServer() {
  try {
    await setupRoutes();
    await server.listen({ port: PORT, host: HOST });
    console.log(`✓ RyanAI API Gateway listening on http://${HOST}:${PORT}`);
    console.log(`✓ Health check: http://${HOST}:${PORT}/health`);
    console.log(`✓ Reasoning endpoint: POST http://${HOST}:${PORT}/api/reasoning/stream`);
    console.log(`✓ MCP endpoint: POST http://${HOST}:${PORT}/api/mcp`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();