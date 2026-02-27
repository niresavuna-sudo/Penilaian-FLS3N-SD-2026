-- Enable Realtime for all tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

-- Table: master_schools
CREATE TABLE IF NOT EXISTS master_schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: master_categories
CREATE TABLE IF NOT EXISTS master_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: peserta
CREATE TABLE IF NOT EXISTS peserta (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  birth_info TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  display_number TEXT,
  scores JSONB DEFAULT '["", "", ""]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  judge_name TEXT,
  judge_nip TEXT,
  place TEXT,
  date TEXT,
  kkks_chairman_name TEXT,
  kkks_chairman_nip TEXT,
  coordinator_name TEXT,
  coordinator_nip TEXT,
  head_of_department_name TEXT,
  head_of_department_nip TEXT,
  category_judges JSONB DEFAULT '{}'::jsonb,
  logo_kabupaten TEXT,
  logo_fls3n TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings row
INSERT INTO settings (id, place, date) 
VALUES (1, 'Beji', '2026-03-01')
ON CONFLICT (id) DO NOTHING;

-- Add tables to the publication for realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE master_schools;
ALTER PUBLICATION supabase_realtime ADD TABLE master_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE peserta;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
