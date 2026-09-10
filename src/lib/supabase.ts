import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../config/env';

const configuredUrl = getEnvVar('VITE_SUPABASE_URL');
const configuredAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured =
  typeof configuredUrl === 'string' &&
  /^https?:\/\//.test(configuredUrl) &&
  typeof configuredAnonKey === 'string' &&
  configuredAnonKey.trim().length > 0;

export const supabaseUrl = isSupabaseConfigured ? configuredUrl : 'https://placeholder.supabase.co';
export const supabaseAnonKey = isSupabaseConfigured ? configuredAnonKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});