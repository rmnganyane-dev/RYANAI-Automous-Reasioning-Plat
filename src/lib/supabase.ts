import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnvVar } from '../config/env';

const configuredUrl = getEnvVar('VITE_SUPABASE_URL');
const configuredAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured: boolean =
  typeof configuredUrl === 'string' &&
  /^https?:\/\//.test(configuredUrl) &&
  typeof configuredAnonKey === 'string' &&
  configuredAnonKey.trim().length > 0;

export const supabaseUrl: string = isSupabaseConfigured
  ? (configuredUrl as string)
  : 'https://placeholder.supabase.co';

export const supabaseAnonKey: string = isSupabaseConfigured
  ? (configuredAnonKey as string)
  : 'placeholder-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});