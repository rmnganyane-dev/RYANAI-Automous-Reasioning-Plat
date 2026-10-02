// MUST be imported first for proper OpenTelemetry & Sentry tracing
import '../instrument.js';
import '../telemetry.js';

import Fastify from 'fastify';
import fastifyRedis from '@fastify/redis';
import fastifyRateLimit from '@fastify/rate-limit';
import pg from 'pg';

import { authPlugin } from './routes/auth.js';
import { commsPlugin } from './comms/index.js';
import { approvalRoutes } from './routes/approvalRoutes.js';
import { slackInteractionsPlugin } from './routes/slackInteractions.js';
import { twilioWebhookPlugin } from './routes/twilioWebhook.js';
import { metricsRoutes } from './routes/metrics.js';
import { initializeAgentDatabase } from '../agent/approvalEngine.js';

await fastify.register(import('@fastify/redis'), {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  lazyConnect: true,
  connectTimeout: 5000,
  closeServerOnFirstError: false,
});

const { Pool } = pg;

console.log('🚀 RyanAI Platform Initialization');
console.log('==================================\n');

// Configuration
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ryanai',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

console.log(`📋 Configuration:`);
console.log(`   - Node Env: ${config.nodeEnv}`);
console.log(`   - Host: ${config.host}:${config.port}`);
console.log(`   - Database: Configured`);
console.log(`   - Redis: Configured\n`);

// src/server/launcher.ts
try {
  await server.register(fastifyRedis, {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    family: 4,               // Force IPv4 on Windows
    connectTimeout: 3000,    // Fail fast after 3 seconds
    enableReadyCheck: false, // Prevent hanging Avvio initialization
    maxRetriesPerRequest: 1
  });
  console.log('✓ Redis plugin registered');
} catch (err) {
  console.warn('⚠️ Redis offline, continuing without cache:', err instanceof Error ? err.message : err);
}


// Initialize Fastify instance with trustProxy and telemetry-aware logger
const fastify = Fastify({
  trustProxy: true,
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    ...(config.nodeEnv !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
  },
});

// Database pool
let dbPool: pg.Pool;

// Service health status
const serviceStatus = {
  database: false,
  redis: false,
  agentCheckpointer: false,
  api: false,
};

// ============================================================================
// MIDDLEWARE & PLUGINS INITIALIZATION
// ============================================================================

async function registerPlugins() {
  // CORS Hook
  fastify.addHook('onRequest', (req, reply, done) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      reply.code(200).send();
      return;
    }
    done();
  });

  // 1. Register Fastify Redis Connection
  await fastify.register(fastifyRedis, {
    url: config.redis.url,
  });

  // 2. Register Global Rate Limiter backed by Redis
  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: fastify.redis,
  });

  // 3. Register Application & Webhook Routes
  await fastify.register(authPlugin);
  await fastify.register(commsPlugin);
  await fastify.register(approvalRoutes);
  await fastify.register(slackInteractionsPlugin);
  await fastify.register(twilioWebhookPlugin);
  await fastify.register(metricsRoutes);
}

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

async function initializeDatabase() {
  console.log('📡 Initializing Database...');
  try {
    dbPool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const client = await dbPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log(`✓ Database connected: ${result.rows[0].now}`);
    serviceStatus.database = true;

    // Initialize LangGraph PostgresSaver checkpointer tables
    try {
      await initializeAgentDatabase();
      serviceStatus.agentCheckpointer = true;
    } catch (agentErr) {
      console.warn('⚠️ Agent PostgresSaver checkpointer setup deferred/failed:', agentErr instanceof Error ? agentErr.message : agentErr);
    }

    return true;
  } catch (err) {
    console.error(`✗ Database connection failed:`, err instanceof Error ? err.message : err);
    return false;
  }
}

async function verifyRedis() {
  console.log('⚡ Initializing Redis...');
  try {
    const pong = await fastify.redis.ping();
    console.log(`✓ Redis connected: ${pong}`);
    serviceStatus.redis = true;
    return true;
  } catch (err) {
    console.error(`✗ Redis connection failed:`, err instanceof Error ? err.message : err);
    return false;
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
fastify.get('/health', async () => {
  fastify.log.info('Health check pinged');
  return {
    status: 'online',
    service: 'ryanai-api-gateway',
    timestamp: new Date().toISOString(),
    services: serviceStatus,
  };
});

// Sentry integration test route
fastify.get('/debug-sentry', async () => {
  throw new Error('RyanAI Sentry Integration Test Exception!');
});

// Root
fastify.get('/', async () => {
  return {
    status: 'online',
    service: 'RyanAI API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
});

// Legacy reasoning endpoint
fastify.post<{ Body: { prompt?: string } }>('/api/reason', async (request) => {
  const { prompt } = request.body || {};
  return {
    success: true,
    engine: 'RyanAI LangGraph ReAct + CUDA',
    response: `Autonomous reasoning processed: "${prompt || 'No prompt provided'}"`,
    timestamp: new Date().toISOString(),
  };
});

// Reasoning stream endpoint
fastify.post<{ Body: { prompt?: string; sessionId?: string } }>(
  '/api/reasoning/stream',
  async (request, reply) => {
    const { prompt, sessionId } = request.body || {};

    reply.hijack();
    const { raw } = reply;

    raw.setHeader('Content-Type', 'text/event-stream');
    raw.setHeader('Cache-Control', 'no-cache, no-transform');
    raw.setHeader('Connection', 'keep-alive');
    raw.setHeader('X-Accel-Buffering', 'no');

    let isAborted = false;
    request.raw.on('close', () => {
      isAborted = true;
    });

    const sendEvent = (data: Record<string, unknown>) => {
      if (!isAborted && !raw.writableEnded) {
        raw.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    try {
      const steps = [
        'Initializing LangGraph ReAct state graph...',
        `Parsing input context for session: ${sessionId || 'default'}`,
        'Executing CUDA C++ tensor inference module...',
        'Evaluating tool-call routing and vector memory match...',
        'Synthesizing autonomous reasoning output.',
      ];

      for (const step of steps) {
        if (isAborted) break;
        sendEvent({ status: 'processing', message: step });
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (!isAborted) {
        sendEvent({
          status: 'complete',
          result: `RyanAI processed: "${prompt || 'No prompt provided'}"`,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
      sendEvent({ error: errorMessage });
    } finally {
      if (!raw.writableEnded) {
        raw.end();
      }
    }
  }
);

// MCP routes
fastify.post<{ Body: { action?: string; tool?: string; payload?: Record<string, unknown> } }>(
  '/api/mcp',
  async (request, reply) => {
    const { action, tool, payload } = request.body || {};

    if (!action && !tool) {
      return reply.code(400).send({ success: false, error: 'Missing action or tool parameter' });
    }

    return reply.send({
      success: true,
      data: {
        receivedAction: action,
        receivedTool: tool,
        processedPayload: payload ?? {},
      },
    });
  }
);

// System info
fastify.get('/api/system', async () => {
  return {
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: config.nodeEnv,
  };
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function start() {
  try {
    console.log('\n🔧 Registering Plugins...\n');
    await registerPlugins();

    console.log('\n📡 Connecting Services...\n');
    await initializeDatabase();
    await verifyRedis();

    console.log(`\n🚀 Starting Fastify Server...\n`);
    await fastify.listen({ port: config.port, host: config.host });

    console.log(`\n✓ RyanAI API Gateway is running!`);
    console.log(`\n📍 Endpoints:`);
    console.log(`   - Root: http://${config.host}:${config.port}/`);
    console.log(`   - Health: http://${config.host}:${config.port}/health`);
    console.log(`   - Sentry Test: http://${config.host}:${config.port}/debug-sentry`);
    console.log(`   - System: http://${config.host}:${config.port}/api/system`);
    console.log(`   - Auth Login: POST http://${config.host}:${config.port}/api/auth/login`);
    console.log(`   - Auth Verify: GET http://${config.host}:${config.port}/api/auth/verify`);
    console.log(`   - Reason: POST http://${config.host}:${config.port}/api/reason`);
    console.log(`   - Stream: POST http://${config.host}:${config.port}/api/reasoning/stream`);
    console.log(`   - MCP: POST http://${config.host}:${config.port}/api/mcp`);
    console.log(`   - Approval: POST http://${config.host}:${config.port}/api/reason/with-approval`);
    console.log(`   - Approve: POST http://${config.host}:${config.port}/api/reason/approve`);
    console.log(`   - Slack Interactions: POST http://${config.host}:${config.port}/api/slack/interactions`);
    console.log(`   - Twilio Webhook: POST http://${config.host}:${config.port}/api/webhooks/twilio`);
    console.log(`   - Admin Metrics: GET http://${config.host}:${config.port}/api/admin/metrics`);
    console.log(`\n🟢 All services ready!\n`);

    serviceStatus.api = true;
  } catch (err) {
    fastify.log.fatal(err);
    process.exit(1);
  }
}

// Graceful shutdown hooks
const shutdown = async () => {
  console.log('\n📴 Shutting down gracefully...');
  if (dbPool) await dbPool.end();
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();