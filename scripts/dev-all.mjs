#!/usr/bin/env node
/**
 * scripts/dev-all.mjs - Start all development services
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const services = [
  { name: 'API Server', cmd: 'npm', args: ['run', 'dev:api'] },
  { name: 'Web UI', cmd: 'npm', args: ['run', 'dev:web'] },
  { name: 'MCP Server', cmd: 'npm', args: ['run', 'mcp:start'] },
];

console.log('🚀 Starting all dev services...\n');

const processes = services.map(service => {
  const proc = spawn(service.cmd, service.args, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (err) => console.error(`❌ ${service.name}: ${err.message}`));
  console.log(`✓ Started ${service.name}`);

  return proc;
});

process.on('SIGINT', () => {
  console.log('\n📴 Shutting down...');
  processes.forEach(p => p.kill());
  process.exit(0);
});
