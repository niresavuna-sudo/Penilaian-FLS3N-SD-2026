/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mkcxrpzsroleniympbpu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rY3hycHpzcm9sZW5peW1wYnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODEzNjEsImV4cCI6MjA4Nzg1NzM2MX0.GaspGXd0skABHQH0Yt6QEykVRKBe-sI93k-n0HJp2jY';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
