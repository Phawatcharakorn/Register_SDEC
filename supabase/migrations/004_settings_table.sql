CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read settings (needed for public hero section)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL USING (auth.role() = 'service_role');

-- Seed initial values
INSERT INTO public.settings (key, value) VALUES
  ('open_date',  '1 กรกฎาคม 2569'),
  ('close_date', '31 กรกฎาคม 2569'),
  ('is_open',    'true')
ON CONFLICT (key) DO NOTHING;
