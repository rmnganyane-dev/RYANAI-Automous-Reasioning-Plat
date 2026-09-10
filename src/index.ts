import Fastify from 'fastify';
import { registerAgentRoutes } from './agent/react.js';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => ({ status: 'healthy', service: 'ryanai-api' }));

// Register ReAct agent routes
await fastify.register(registerAgentRoutes);

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`RyanAI API server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();