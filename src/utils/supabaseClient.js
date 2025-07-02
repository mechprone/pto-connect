import { createClient } from '@supabase/supabase-js';
import { logSessionDebug } from './debugSession';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing or undefined');
  console.log('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing or undefined');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Cannot initialize Supabase client - missing environment variables');
  console.log('supabaseUrl:', supabaseUrl ? 'present' : 'missing');
  console.log('supabaseAnonKey:', supabaseAnonKey ? 'present' : 'missing');
  throw new Error('Supabase configuration is incomplete. Check environment variables.');
}

// Singleton pattern for Supabase client
let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    console.log('[DEBUG] Creating Supabase client with session persistence options');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    logSessionDebug('supabaseClient.js');
  }
  return supabaseInstance;
}

// For legacy imports
export const supabase = getSupabaseClient();