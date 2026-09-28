import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    cppEngine?: {
      evaluate: (prompt: string) => any;
    };
    transcend?: {
      evaluate: (payload: Record<string, any>) => any;
    };
  }
}