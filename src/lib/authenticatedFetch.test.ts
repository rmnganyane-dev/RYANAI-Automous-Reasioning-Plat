import { beforeEach, expect, it, vi } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { auth: { getSession } } }));
vi.mock('./apiBaseUrl', () => ({ API_BASE_URL: 'https://api.example.test' }));
import { authenticatedFetch } from './authenticatedFetch';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
  getSession
    .mockReset()
    .mockResolvedValue({
      data: { session: { access_token: 'current-session' } },
      error: null,
    });
});

it('attaches the current access token to JSON and streaming API requests', async () => {
  const signal = new AbortController().signal;
  await authenticatedFetch('https://api.example.test/api/reasoning/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'stale' },
    body: '{}',
    signal,
  });
  const [url, init] = vi.mocked(fetch).mock.calls[0];
  expect(url).toBe('https://api.example.test/api/reasoning/stream');
  expect(new Headers(init?.headers).get('authorization')).toBe(
    'Bearer current-session',
  );
  expect(new Headers(init?.headers).get('content-type')).toBe(
    'application/json',
  );
  expect(init).toMatchObject({
    signal,
    body: '{}',
    method: 'POST',
    credentials: 'omit',
    redirect: 'error',
  });
});

it('reads the refreshed session for each request', async () => {
  await authenticatedFetch('/api/reason');
  getSession.mockResolvedValue({
    data: { session: { access_token: 'refreshed' } },
    error: null,
  });
  await authenticatedFetch('/api/reason');
  expect(
    new Headers(vi.mocked(fetch).mock.calls[1][1]?.headers).get(
      'authorization',
    ),
  ).toBe('Bearer refreshed');
});

it.each([
  { data: { session: null }, error: null },
  { data: { session: null }, error: new Error('expired') },
])('does not call the backend without a usable session', async (result) => {
  getSession.mockResolvedValue(result);
  await expect(authenticatedFetch('/api/reason')).rejects.toThrow('sign in');
  expect(fetch).not.toHaveBeenCalled();
});

it.each([
  'https://other.example/api/reason',
  '//other.example/api/reason',
  'https://api.example.test/health',
])('does not disclose a token to %s', async (url) => {
  await expect(authenticatedFetch(url)).rejects.toThrow('configured API');
  expect(getSession).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
