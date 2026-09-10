import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../config/env';

var configuredUrl = getEnvVar('VITE_SUPABASE_URL');
var configuredAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export var isSupabaseConfigured =
  typeof configuredUrl === 'string' &&
  /^https?:\/\//.test(configuredUrl) &&
  typeof configuredAnonKey === 'string' &&
  configuredAnonKey.trim().length > 0;

export var supabaseUrl = isSupabaseConfigured ? configuredUrl : 'https://placeholder.supabase.co';
export var supabaseAnonKey = isSupabaseConfigured ? configuredAnonKey : 'placeholder-key';

export var supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});