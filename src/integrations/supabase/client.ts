import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://zhbeklqgcmfqbvywvrxf.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYmVrbHFnY21mcWJ2eXd2cnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDY1ODIsImV4cCI6MjA4NTg4MjU4Mn0.0Z90ZAXF6wmzx93hX5rl_68GPYiZ3fEHREQhxwpiEzY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
