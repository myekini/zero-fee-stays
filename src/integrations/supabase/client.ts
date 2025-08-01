// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ihgzllefbkzqnomsviwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ3psbGVmYmt6cW5vbXN2aXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTg0NjQsImV4cCI6MjA2OTU3NDQ2NH0.IMmU1sBtpDmmg9GZNZkMedRFCF7FFLsZz4InGQkFKKE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});