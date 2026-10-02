import Fastify from 'fastify';
import fastifyRedis from '@fastify/redis';
import { reasonPlugin } from './routes/reason.js';
import { RyanMCPServer } from '../mcp/ryanMcpServer.js';

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

// Health check endpoint with live Redis ping
server.get('/health', async () => {
  let redisStatus = 'not-configured';
  try {
    if (server.redis) {
      await server.redis.ping();
      redisStatus = 'connected';
    }
  } catch {
    redisStatus = 'disconnected';
  }

  return {
    status: 'online',
    service: 'ryanai-api-gateway',
    database: process.env.DATABASE_URL ? 'configured' : 'not-configured',
    redis: redisStatus,
    cudaDevice: process.env.CUDA_DEVICE_ID || '0',
    timestamp: new Date().toISOString()
  };
});

// Register plugins and feature routes
async function setupRoutes() {
  // Register Redis plugin with explicit IPv4 configuration to prevent Windows timeout hangs
  try {
    await server.register(fastifyRedis, {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      family: 4 // Forces IPv4 to bypass Windows IPv6 resolution delay
    });
    console.log('✓ Redis plugin registered successfully');
  } catch (err) {
    console.error('Failed to register Redis plugin:', err);
  }

  try {
    // Register reasoning plugin routes
    await server.register(reasonPlugin);
    console.log('✓ Reasoning routes registered');
  } catch (err) {
    console.error('Failed to register reasoning routes:', err);
  }

  try {
    // Initialize MCP server instance
    const mcpServer = new RyanMCPServer();
    void mcpServer; // Explicitly suppress unused variable warning
    console.log('✓ RyanMCPServer initialized successfully');
  } catch (err) {
    console.error('Failed to initialize RyanMCPServer:', err);
  }
}

// Start server
async function startServer() {
  try {
    await setupRoutes();
    await server.listen({ port: PORT, host: HOST });
    console.log(`✓ RyanAI API Gateway listening on http://${HOST}:${PORT}`);
    console.log(`✓ Health check: http://${HOST}:${PORT}/health`);
    console.log(`✓ Reasoning endpoint: POST http://${HOST}:${PORT}/api/reason`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();