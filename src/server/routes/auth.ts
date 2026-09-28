import { FastifyPluginAsync } from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_prod',
  });
  await fastify.register(cookie);

  // 1. Admin Login Route with strict rate limit (5 attempts per 5 minutes)
  fastify.post(
    '/api/auth/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '5 minutes',
        },
      },
    },
    async (request, reply) => {
      const { username, password } = (request.body as { username?: string; password?: string }) || {};

      const validUser = username === (process.env.ADMIN_USERNAME || 'admin');
      const validPass = password === (process.env.ADMIN_PASSWORD || 'securepassword123');

      if (!validUser || !validPass) {
        reply.status(401);
        return { success: false, error: 'Invalid credentials' };
      }

      // Sign JWT token valid for 8 hours
      const token = fastify.jwt.sign({ username }, { expiresIn: '8h' });

      // Set HttpOnly cookie for security
      reply.setCookie('ryanai_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return { success: true, message: 'Authenticated successfully' };
    }
  );

  // 2. Token Validation Check Route
  fastify.get('/api/auth/verify', async (request, reply) => {
    try {
      await request.jwtVerify();
      return { authenticated: true };
    } catch (err) {
      reply.status(401);
      return { authenticated: false, error: 'Unauthorized' };
    }
  });

  // 3. Admin Logout Route
  fastify.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie('ryanai_token', { path: '/' });
    return { success: true, message: 'Logged out successfully' };
  });
};