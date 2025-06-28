import { createClient } from '@supabase/supabase-js';

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

// Only create client if both values are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Cannot initialize Supabase client - missing environment variables');
  console.log('supabaseUrl:', supabaseUrl ? 'present' : 'missing');
  console.log('supabaseAnonKey:', supabaseAnonKey ? 'present' : 'missing');
  throw new Error('Supabase configuration is incomplete. Check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);