import { supabase } from './supabase';
import { API_BASE_URL } from './apiBaseUrl';

/** Send a current session only to our configured API, never an arbitrary URL. */
export async function authenticatedFetch(
  input: string,
  init: RequestInit = {},
) {
  const api = new URL(API_BASE_URL);
  const target = new URL(input, api);
  if (target.origin !== api.origin || !target.pathname.startsWith('/api/')) {
    throw new Error('Authenticated requests must target the configured API.');
  }
  if (!supabase)
    throw new Error(
      'Sign-in is unavailable. Please contact your administrator.',
    );
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Please sign in to continue.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  return fetch(target.toString(), {
    ...init,
    headers,
    credentials: 'omit',
    redirect: 'error',
  });
}
