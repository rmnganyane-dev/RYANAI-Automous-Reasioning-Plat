#!/usr/bin/env node
/**
 * scripts/tunnel.ts - Ngrok tunnel for webhooks
 */
import ngrok from '@ngrok/ngrok';
import { createLogger } from '../src/shared/logger.js';

const logger = createLogger('tunnel');

async function startTunnel() {
  try {
    logger.info('🔗 Starting ngrok tunnel...');
    
    const url = await ngrok.connect({
      addr: 3000,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });

    logger.info(`✓ Tunnel active: ${url}`);
    logger.info('Use this URL for webhooks (Slack, Twilio, etc.)');
    logger.info('Press Ctrl+C to stop');

    // Keep tunnel alive
    await new Promise(() => {});
  } catch (err: any) {
    logger.error(`Tunnel error: ${err.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Closing tunnel...');
  await ngrok.disconnect();
  process.exit(0);
});

startTunnel();
