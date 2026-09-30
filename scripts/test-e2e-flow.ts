#!/usr/bin/env node
/**
 * scripts/test-e2e-flow.ts - E2E test flow
 */
import { createLogger } from '../src/shared/logger.js';

const logger = createLogger('e2e-test');

async function runE2ETests() {
  logger.info('🧪 Starting E2E tests...\n');

  const tests = [
    {
      name: 'API Health Check',
      fn: async () => {
        const res = await fetch('http://localhost:3000/health');
        return res.ok;
      },
    },
    {
      name: 'WebSocket Connection',
      fn: async () => {
        return new Promise((resolve) => {
          const ws = new WebSocket('ws://localhost:3000/ws');
          const timeout = setTimeout(() => {
            ws.close();
            resolve(false);
          }, 5000);
          ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          };
          ws.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };
        });
      },
    },
    {
      name: 'Reasoning Endpoint',
      fn: async () => {
        const res = await fetch('http://localhost:3000/api/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Test' }),
        });
        return res.ok;
      },
    },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        logger.info(`✓ ${test.name}`);
        passed++;
      } else {
        logger.error(`✗ ${test.name}`);
      }
    } catch (err: any) {
      logger.error(`✗ ${test.name}: ${err.message}`);
    }
  }

  logger.info(`\n✅ ${passed}/${tests.length} tests passed`);
  process.exit(passed === tests.length ? 0 : 1);
}

runE2ETests().catch((err) => {
  logger.error(err);
  process.exit(1);
});
