-- Create master_schools table
CREATE TABLE IF NOT EXISTS master_schools (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create master_categories table
CREATE TABLE IF NOT EXISTS master_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create peserta table
CREATE TABLE IF NOT EXISTS peserta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  display_number TEXT,
  scores JSONB
);

-- Create settings table
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
  category_judges JSONB,
  logo_kabupaten TEXT,
  logo_fls3n TEXT,
  background_sertifikat TEXT
);

-- Insert default settings row if not exists
INSERT INTO settings (id, head_of_department_name, head_of_department_nip) 
VALUES (1, 'TRI KRISNI ASTUTI, S.Sos, MM.', '197004241997032007') 
ON CONFLICT (id) DO UPDATE SET 
  head_of_department_name = EXCLUDED.head_of_department_name,
  head_of_department_nip = EXCLUDED.head_of_department_nip;

-- Disable Row Level Security (RLS) to allow public access for this app
ALTER TABLE master_schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE peserta DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
