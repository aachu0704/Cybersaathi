-- 1. Create enum type for lecturer status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lecturer_status') THEN
    CREATE TYPE lecturer_status AS ENUM ('Available', 'Busy', 'Not Available');
  END IF;
END$$;

-- 2. Create lecturers table
CREATE TABLE IF NOT EXISTS lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT 'TBD',
  status lecturer_status NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;

-- 4. Permissive policies for hackathon demo (allow public access without auth)
DROP POLICY IF EXISTS "Allow public select" ON lecturers;
CREATE POLICY "Allow public select" ON lecturers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON lecturers;
CREATE POLICY "Allow public insert" ON lecturers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON lecturers;
CREATE POLICY "Allow public update" ON lecturers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON lecturers;
CREATE POLICY "Allow public delete" ON lecturers FOR DELETE USING (true);

-- 5. Enable Supabase Realtime on the table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE lecturers;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END$$;

-- 6. Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lecturers_updated_at ON lecturers;
CREATE TRIGGER update_lecturers_updated_at
  BEFORE UPDATE ON lecturers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Seed 7 lecturers
INSERT INTO lecturers (name, room, status)
VALUES
  ('Dr. Ravi Kumar', 'C204', 'Available'),
  ('Dr. Meena Sharma', 'C210', 'Busy'),
  ('Prof. Arjun Patel', 'B301', 'Available'),
  ('Dr. Priya Nair', 'A105', 'Not Available'),
  ('Prof. Suresh Reddy', 'D402', 'Available'),
  ('Dr. Anita Gupta', 'C312', 'Busy'),
  ('Prof. Vikram Singh', 'B208', 'Available')
ON CONFLICT (id) DO NOTHING;
