const apiUrl = (process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const webUrl = (process.env.WEB_BASE_URL || 'http://localhost:9090').replace(/\/+$/, '');
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS || 5000);
const results: { name: string; error?: string }[] = [];

async function test(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
    results.push({ name });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${name}: ${message}`);
    results.push({ name, error: message });
  }
}

async function main(): Promise<void> {
  await test('API health endpoint', async () => {
    const response = await fetch(`${apiUrl}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const health = await response.json();
    if (health.status !== 'online') throw new Error('API did not report online');
  });

  await test('Frontend is served', async () => {
    const response = await fetch(webUrl, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('Frontend response is not HTML');
    }
  });

  await test('Reasoning endpoint rejects empty prompts', async () => {
    const response = await fetch(`${apiUrl}/api/reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '  ' }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status !== 400) {
      throw new Error(`Expected HTTP 400, received HTTP ${response.status}`);
    }
  });

  await test('WebSocket endpoint accepts upgrades', async () => {
    const wsUrl = new URL('/ws', apiUrl);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error(`Connection timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      socket.addEventListener('open', () => {
        clearTimeout(timeout);
        socket.close();
        resolve();
      }, { once: true });
      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      }, { once: true });
    });
  });

  const failed = results.filter((result) => result.error);
  console.log(`\nEnd-to-end checks: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
