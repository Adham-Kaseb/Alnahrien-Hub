import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkchdxdcrbqldvsgbpej.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY2hkeGRjcmJxbGR2c2dicGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTA4NjYsImV4cCI6MjA5ODMyNjg2Nn0.zS6sCkHnYHh6bxi9cHXAYZdGGhSco-e3GvcZqhb0UVc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
