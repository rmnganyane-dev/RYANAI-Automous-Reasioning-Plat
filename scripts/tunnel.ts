#!/usr/bin/env node
/**
 * scripts/tunnel.ts - Ngrok tunnel for webhooks
 */
import '../src/loadEnv.js';
import ngrok from '@ngrok/ngrok';
import { createLogger } from '../src/shared/logger.js';

const logger = createLogger('tunnel');

/**
 * Open an ngrok tunnel to PORT (default 3001) and remain pending while it is active.
 * Invalid ports reject; missing credentials and connection errors set process.exitCode
 * to 1 and resolve.
 */
async function startTunnel() {
  const port = Number(process.env.PORT || '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid API port: ${process.env.PORT}`);
  }

  try {
    if (!process.env.NGROK_AUTHTOKEN) {
      throw new Error(
        'Set NGROK_AUTHTOKEN in the root .env or shell environment before starting the tunnel.',
      );
    }
    logger.info('🔗 Starting ngrok tunnel...');

    const url = await ngrok.connect({
      addr: port,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });

    logger.info(`✓ Tunnel active: ${url}`);
    logger.info('Use this URL for webhooks (Slack, Twilio, etc.)');
    logger.info('Press Ctrl+C to stop');

    // Keep tunnel alive
    await new Promise(() => {});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Tunnel error: ${message}`);
    process.exitCode = 1;
  }
}

process.on('SIGINT', async () => {
  logger.info('Closing tunnel...');
  await ngrok.disconnect();
  process.exit(0);
});

startTunnel();
