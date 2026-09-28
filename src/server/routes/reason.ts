import { FastifyPluginAsync } from 'fastify';
import { reasoningAgent } from '../../agent/engine';

export const reasonPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/reason', async (request, reply) => {
    const { prompt } = request.body as { prompt: string };

    try {
      const result = await reasoningAgent.invoke({
        messages: [{ role: 'user', content: prompt }],
      });

      const lastMessage = result.messages[result.messages.length - 1];

      return {
        success: true,
        engine: 'RyanAI LangGraph ReAct',
        response: lastMessage.content,
        trace: result.messages,
      };
    } catch (err: any) {
      reply.status(500);
      return { success: false, error: err.message };
    }
  });
};