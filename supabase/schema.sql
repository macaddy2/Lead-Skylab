-- Lead Skylab Database Schema for Supabase (SAFE VERSION)
-- Handles existing objects gracefully

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'direct',
    stage TEXT NOT NULL DEFAULT 'new',
    score INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_user_id_idx ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS leads_stage_idx ON public.leads(stage);
CREATE INDEX IF NOT EXISTS leads_source_idx ON public.leads(source);

-- =============================================
-- LANDING PAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    template TEXT NOT NULL,
    sections JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    analytics JSONB DEFAULT '{"views": 0, "uniqueVisitors": 0, "formSubmissions": 0, "conversionRate": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS landing_pages_user_id_idx ON public.landing_pages(user_id);
CREATE INDEX IF NOT EXISTS landing_pages_status_idx ON public.landing_pages(status);

-- =============================================
-- EXPERIMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    type TEXT NOT NULL,
    target_id UUID NOT NULL,
    traffic_split INTEGER[] DEFAULT '{50, 50}',
    metric TEXT NOT NULL,
    winner UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS experiments_user_id_idx ON public.experiments(user_id);
CREATE INDEX IF NOT EXISTS experiments_status_idx ON public.experiments(status);

-- =============================================
-- EXPERIMENT VARIANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.experiment_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    impressions INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS experiment_variants_experiment_id_idx ON public.experiment_variants(experiment_id);

-- =============================================
-- SURVEYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    type TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{"showProgressBar": true, "allowAnonymous": false, "thankYouMessage": "Thank you!"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS surveys_user_id_idx ON public.surveys(user_id);
CREATE INDEX IF NOT EXISTS surveys_status_idx ON public.surveys(status);

-- =============================================
-- SURVEY RESPONSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_email TEXT,
    answers JSONB NOT NULL DEFAULT '[]',
    metadata JSONB,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS survey_responses_survey_id_idx ON public.survey_responses(survey_id);

-- =============================================
-- AUDIENCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'segment',
    criteria JSONB NOT NULL DEFAULT '[]',
    size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audiences_user_id_idx ON public.audiences(user_id);

-- =============================================
-- CONTENT PIECES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    tone TEXT NOT NULL DEFAULT 'professional',
    campaign_id UUID,
    template_id UUID,
    hashtags TEXT[] DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    analytics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_pieces_user_id_idx ON public.content_pieces(user_id);
CREATE INDEX IF NOT EXISTS content_pieces_status_idx ON public.content_pieces(status);
CREATE INDEX IF NOT EXISTS content_pieces_platform_idx ON public.content_pieces(platform);

-- =============================================
-- CONTENT CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    platforms TEXT[] DEFAULT '{}',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_campaigns_user_id_idx ON public.content_campaigns(user_id);

-- Add foreign key if not exists
DO $$ BEGIN
    ALTER TABLE public.content_pieces 
    ADD CONSTRAINT content_pieces_campaign_id_fkey 
    FOREIGN KEY (campaign_id) REFERENCES public.content_campaigns(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- PRODUCT PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT,
    description TEXT NOT NULL,
    value_props TEXT[] DEFAULT '{}',
    target_audience TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    tone TEXT NOT NULL DEFAULT 'professional',
    competitors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- LAUNCH PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.launch_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    product_name TEXT NOT NULL,
    product_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    input_mode TEXT NOT NULL DEFAULT 'manual',
    preferences JSONB NOT NULL DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    launch_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS launch_plans_user_id_idx ON public.launch_plans(user_id);
CREATE INDEX IF NOT EXISTS launch_plans_status_idx ON public.launch_plans(status);

-- =============================================
-- LAUNCH PHASES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.launch_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.launch_plans(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    milestones JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS launch_phases_plan_id_idx ON public.launch_phases(plan_id);

-- =============================================
-- CONTENT QUEUE ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_queue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.launch_plans(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES public.launch_phases(id) ON DELETE CASCADE,
    content_piece_id UUID NOT NULL REFERENCES public.content_pieces(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    error TEXT
);

CREATE INDEX IF NOT EXISTS content_queue_items_plan_id_idx ON public.content_queue_items(plan_id);
CREATE INDEX IF NOT EXISTS content_queue_items_status_idx ON public.content_queue_items(status);
CREATE INDEX IF NOT EXISTS content_queue_items_scheduled_idx ON public.content_queue_items(scheduled_date, scheduled_time);

-- =============================================
-- ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_user_id_idx ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON public.activities(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can CRUD own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can CRUD own landing_pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can CRUD own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can CRUD own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can CRUD own audiences" ON public.audiences;
DROP POLICY IF EXISTS "Users can CRUD own content_pieces" ON public.content_pieces;
DROP POLICY IF EXISTS "Users can CRUD own content_campaigns" ON public.content_campaigns;
DROP POLICY IF EXISTS "Users can CRUD own product_profiles" ON public.product_profiles;
DROP POLICY IF EXISTS "Users can CRUD own launch_plans" ON public.launch_plans;
DROP POLICY IF EXISTS "Users can CRUD own activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can submit survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Users can view responses to their surveys" ON public.survey_responses;
DROP POLICY IF EXISTS "Users can CRUD variants for own experiments" ON public.experiment_variants;
DROP POLICY IF EXISTS "Users can CRUD phases for own launch_plans" ON public.launch_phases;
DROP POLICY IF EXISTS "Users can CRUD queue items for own plans" ON public.content_queue_items;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own landing_pages" ON public.landing_pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own experiments" ON public.experiments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own surveys" ON public.surveys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own audiences" ON public.audiences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own content_pieces" ON public.content_pieces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own content_campaigns" ON public.content_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own product_profiles" ON public.product_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own launch_plans" ON public.launch_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can submit survey responses" ON public.survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view responses to their surveys" ON public.survey_responses FOR SELECT 
USING (survey_id IN (SELECT id FROM public.surveys WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD variants for own experiments" ON public.experiment_variants FOR ALL 
USING (experiment_id IN (SELECT id FROM public.experiments WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD phases for own launch_plans" ON public.launch_phases FOR ALL 
USING (plan_id IN (SELECT id FROM public.launch_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can CRUD queue items for own plans" ON public.content_queue_items FOR ALL 
USING (plan_id IN (SELECT id FROM public.launch_plans WHERE user_id = auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
DROP TRIGGER IF EXISTS update_landing_pages_updated_at ON public.landing_pages;
DROP TRIGGER IF EXISTS update_experiments_updated_at ON public.experiments;
DROP TRIGGER IF EXISTS update_surveys_updated_at ON public.surveys;
DROP TRIGGER IF EXISTS update_audiences_updated_at ON public.audiences;
DROP TRIGGER IF EXISTS update_content_pieces_updated_at ON public.content_pieces;
DROP TRIGGER IF EXISTS update_content_campaigns_updated_at ON public.content_campaigns;
DROP TRIGGER IF EXISTS update_product_profiles_updated_at ON public.product_profiles;
DROP TRIGGER IF EXISTS update_launch_plans_updated_at ON public.launch_plans;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audiences_updated_at BEFORE UPDATE ON public.audiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_pieces_updated_at BEFORE UPDATE ON public.content_pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_campaigns_updated_at BEFORE UPDATE ON public.content_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_profiles_updated_at BEFORE UPDATE ON public.product_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_launch_plans_updated_at BEFORE UPDATE ON public.launch_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO CREATE USER PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
