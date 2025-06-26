
-- Create dispensaries table for imported CSV data
CREATE TABLE public.dispensaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_display_name TEXT,
  hoodie_id TEXT,
  verified_license TEXT,
  match_type TEXT,
  confidence_score TEXT,
  is_verified TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for brand ambassador management
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'ambassador',
  territory TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visits table for tracking brand ambassador visits
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispensary_id UUID REFERENCES public.dispensaries(id) NOT NULL,
  rep_email TEXT NOT NULL,
  visit_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  visit_purpose TEXT,
  samples_given TEXT,
  estimated_cost NUMERIC,
  notes TEXT,
  analysis_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dispensaries table (read-only for authenticated users)
CREATE POLICY "Authenticated users can view dispensaries" 
  ON public.dispensaries 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (email = auth.email());

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING (email = auth.email());

-- RLS Policies for visits table
CREATE POLICY "Users can view visits with their email" 
  ON public.visits 
  FOR SELECT 
  TO authenticated 
  USING (rep_email = auth.email());

CREATE POLICY "Users can create visits with their email" 
  ON public.visits 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (rep_email = auth.email());

CREATE POLICY "Users can update their own visits" 
  ON public.visits 
  FOR UPDATE 
  TO authenticated 
  USING (rep_email = auth.email());

-- Create indexes for better performance
CREATE INDEX idx_dispensaries_survey_display_name ON public.dispensaries (survey_display_name);
CREATE INDEX idx_visits_dispensary_id ON public.visits (dispensary_id);
CREATE INDEX idx_visits_rep_email ON public.visits (rep_email);
CREATE INDEX idx_visits_created_at ON public.visits (created_at);
CREATE INDEX idx_users_email ON public.users (email);

-- Insert sample dispensary data (you can replace this with actual CSV import)
INSERT INTO public.dispensaries (survey_display_name, hoodie_id, verified_license, match_type, confidence_score, is_verified) VALUES
('Green Cross Dispensary', 'GC001', 'CA-LIC-12345', 'exact', '100', 'true'),
('Cannabis Corner', 'CC002', 'CA-LIC-23456', 'exact', '95', 'true'),
('The Green Room', 'TGR003', 'CA-LIC-34567', 'fuzzy', '85', 'false');
