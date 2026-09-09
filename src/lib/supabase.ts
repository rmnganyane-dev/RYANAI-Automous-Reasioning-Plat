import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = typeof configuredUrl === 'string' && /^https?:\/\//.test(configuredUrl)
  ? configuredUrl
  : null;
const supabaseAnonKey = typeof configuredAnonKey === 'string' && configuredAnonKey.trim().length > 0
  ? configuredAnonKey
  : null;

export const isSupabaseConfigured = supabaseUrl !== null && supabaseAnonKey !== null;

export const supabase = createClient(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseAnonKey ?? 'local-development-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
);
