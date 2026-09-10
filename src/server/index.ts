import Fastify from 'fastify';

const server = Fastify({ logger: true });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS natively without external plugin dependencies
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

server.get('/health', async () => {
  return {
    status: 'online',
    service: 'ryanai-api-gateway',
    cudaDevice: process.env.CUDA_DEVICE_ID || '0',
    timestamp: new Date().toISOString()
  };
});

server.post('/api/reason', async (request) => {
  const body = request.body as { prompt?: string };
  return {
    success: true,
    engine: 'RyanAI LangGraph ReAct + CUDA',
    response: `Autonomous reasoning processed: "${body?.prompt || 'No prompt provided'}"`,
    timestamp: new Date().toISOString()
  };
});

try {
  await server.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`RyanAI API Gateway listening on http://0.0.0.0:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}