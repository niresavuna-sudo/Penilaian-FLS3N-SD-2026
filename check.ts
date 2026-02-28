import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkcxrpzsroleniympbpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rY3hycHpzcm9sZW5peW1wYnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODEzNjEsImV4cCI6MjA4Nzg1NzM2MX0.GaspGXd0skABHQH0Yt6QEykVRKBe-sI93k-n0HJp2jY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('master_schools').select('*');
  console.log('Schools:', data);
  if (error) console.error('Error:', error);
}

check();
