import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client safely
 * Returns null if environment variables are not available (during build)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase environment variables not available - likely during build process');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Creates a regular Supabase client safely
 * Returns null if environment variables are not available (during build)  
 */
export function createClientSafe() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not available - likely during build process');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}