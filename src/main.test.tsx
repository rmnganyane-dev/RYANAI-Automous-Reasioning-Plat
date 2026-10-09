// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import ErrorBoundary from './components/ErrorBoundary';

vi.mock('./App', () => ({
  default: () => <nav aria-label="Main navigation">RyanAI workspace</nav>,
}));
vi.mock('./lib/platformHealth', () => ({
  getPlatformHealth: () => new Promise(() => {}),
}));

const authenticatedRequest = vi.hoisted(() => vi.fn());
vi.mock('./lib/authenticatedFetch', () => ({
  authenticatedFetch: authenticatedRequest,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  authenticatedRequest.mockReset();
});

it('mounts the UI while the backend health request remains pending', async () => {
  document.body.innerHTML = '<div id="root">Loading...</div>';
  await act(async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.stubEnv('VITE_API_URL', 'https://legacy-api.example.test/');
    const { API_BASE_URL, APP_ENV } = await import('./main');
    expect(API_BASE_URL).toBe('https://legacy-api.example.test');
    expect(APP_ENV).toBe(import.meta.env.MODE);
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  expect(document.querySelector('nav')?.textContent).toBe('RyanAI workspace');
  expect(document.getElementById('root')?.textContent).not.toContain(
    'Loading...',
  );
});

it('shows a recovery action when a view throws during rendering', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  function BrokenView(): never {
    throw new Error('view failed');
  }
  try {
    await act(async () => {
      root.render(
        <ErrorBoundary>
          <BrokenView />
        </ErrorBoundary>,
      );
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'RyanAI could not load this view',
    );
    expect(container.querySelector('button')?.textContent).toBe(
      'Reload RyanAI',
    );
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});

it('returns authenticated API responses and preserves request options', async () => {
  const { apiClient, API_BASE_URL, APP_VERSION } = await import('./main');
  const payload = { accepted: true };
  authenticatedRequest.mockResolvedValue(new Response(JSON.stringify(payload)));
  const controller = new AbortController();
  const result = await apiClient.request<typeof payload>('/api/pipeline/execute', {
    method: 'POST',
    body: JSON.stringify({ targetEnv: 'staging', autoShip: false }),
    headers: new Headers({ 'X-Request-ID': 'request-1' }),
    signal: controller.signal,
  });
  expect(result).toEqual(payload);
  expect(authenticatedRequest).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/pipeline/execute`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ targetEnv: 'staging', autoShip: false }),
      signal: controller.signal,
    }),
  );
  const headers = authenticatedRequest.mock.calls[0][1].headers as Headers;
  expect(headers.get('Content-Type')).toBe('application/json');
  expect(headers.get('X-App-Version')).toBe(APP_VERSION);
  expect(headers.get('X-Request-ID')).toBe('request-1');
});

it('sends pipeline, governance, recycling and telemetry requests', async () => {
  const { apiClient, API_BASE_URL } = await import('./main');
  authenticatedRequest.mockImplementation(async () =>
    new Response(JSON.stringify({ ok: true })),
  );
  const requests = [
    [() => apiClient.executePipeline('staging', false), '/api/pipeline/execute', 'POST'],
    [() => apiClient.getPipelineStatus(), '/api/pipeline/status', 'GET'],
    [() => apiClient.getGovernanceErrors('open'), '/api/governance/errors?filter=open', 'GET'],
    [() => apiClient.applyAutoFix('issue-1'), '/api/governance/fix/issue-1', 'POST'],
    [() => apiClient.getRecycledItems('code'), '/api/recycling/items?category=code', 'GET'],
    [() => apiClient.restoreRecycledItem('item-1'), '/api/recycling/restore/item-1', 'POST'],
    [() => apiClient.getTelemetry(), '/api/telemetry', 'GET'],
    [() => apiClient.runDiagnosticSweep(), '/api/telemetry/diagnostic', 'POST'],
  ] as const;
  for (const [send, path, method] of requests) {
    await expect(send()).resolves.toEqual({ ok: true });
    const [url, init] = authenticatedRequest.mock.lastCall!;
    expect(url).toBe(`${API_BASE_URL}${path}`);
    expect(init.method ?? 'GET').toBe(method);
  }
});

it('rejects HTTP errors and authentication failures', async () => {
  const { apiClient } = await import('./main');
  authenticatedRequest.mockResolvedValueOnce(new Response('{}', { status: 403 }));
  await expect(apiClient.getTelemetry()).rejects.toThrow('HTTP 403');
  authenticatedRequest.mockRejectedValueOnce(new Error('Please sign in to continue.'));
  await expect(apiClient.getTelemetry()).rejects.toThrow('Please sign in');
});
