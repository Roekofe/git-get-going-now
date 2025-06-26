
-- Drop the existing tables and recreate with exact CSV column names
DROP TABLE IF EXISTS public.visits;
DROP TABLE IF EXISTS public.dispensaries;

-- Create dispensaries table with exact CSV column names (matching capitalization)
CREATE TABLE public.dispensaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "Survey_Display_Name" TEXT,
  "Hoodie_ID" TEXT,
  "Hoodie_License" TEXT,
  "Verified_License" TEXT,
  "OLCC_Business_Name" TEXT,
  "Match_Type" TEXT,
  "Verification_Notes" TEXT,
  "Confidence_Score" TEXT,
  "Is_Verified" TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recreate visits table with proper foreign key
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

-- Re-enable RLS and recreate policies
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dispensaries"
  ON public.dispensaries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view visits with their email"
  ON public.visits FOR SELECT TO authenticated USING (rep_email = auth.email());

CREATE POLICY "Users can create visits with their email"
  ON public.visits FOR INSERT TO authenticated WITH CHECK (rep_email = auth.email());

CREATE POLICY "Users can update their own visits"
  ON public.visits FOR UPDATE TO authenticated USING (rep_email = auth.email());

-- Recreate indexes with quoted column names
CREATE INDEX "idx_dispensaries_survey_display_name" ON public.dispensaries ("Survey_Display_Name");
CREATE INDEX idx_visits_dispensary_id ON public.visits (dispensary_id);
CREATE INDEX idx_visits_rep_email ON public.visits (rep_email);
CREATE INDEX idx_visits_created_at ON public.visits (created_at);
