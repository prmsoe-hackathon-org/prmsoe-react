-- PRMSOE Full Schema Migration
-- Includes: tables from prmsoe-fast-api migration, RLS policies, auth trigger

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE intent_type AS ENUM ('VALIDATION', 'SALES');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_status AS ENUM ('NEW', 'RESEARCHING', 'DRAFT_READY', 'SENT', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE strategy_tag AS ENUM ('PAIN_POINT', 'VALIDATION_ASK', 'DIRECT_PITCH', 'MUTUAL_CONNECTION', 'INDUSTRY_TREND');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE feedback_status AS ENUM ('PENDING', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE outcome_type AS ENUM ('REPLIED', 'GHOSTED', 'BOUNCED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  mission_statement text NOT NULL DEFAULT '',
  intent_type intent_type NOT NULL DEFAULT 'VALIDATION',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  full_name text,
  linkedin_url text,
  raw_role text,
  company_name text,
  status contact_status DEFAULT 'NEW',
  draft_message text,
  strategy_tag strategy_tag,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_status ON contacts(user_id, status);

CREATE TABLE IF NOT EXISTS research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) UNIQUE,
  news_summary text,
  pain_points text,
  source_url text,
  raw_response jsonb,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id),
  strategy_tag strategy_tag,
  message_body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  feedback_due_at timestamptz,
  feedback_status feedback_status DEFAULT 'PENDING',
  outcome outcome_type
);

CREATE INDEX IF NOT EXISTS idx_outreach_feedback ON outreach_attempts(feedback_status, feedback_due_at);

CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  total_contacts integer,
  processed_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status job_status DEFAULT 'RUNNING',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own row
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- contacts: users can CRUD their own contacts
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (user_id = auth.uid());

-- research: users can view research for their own contacts
CREATE POLICY "Users can view own research" ON research
  FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- outreach_attempts: users can view/insert for their own contacts
CREATE POLICY "Users can view own outreach" ON outreach_attempts
  FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own outreach" ON outreach_attempts
  FOR INSERT WITH CHECK (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own outreach" ON outreach_attempts
  FOR UPDATE USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
  );

-- enrichment_jobs: users can view their own jobs
CREATE POLICY "Users can view own jobs" ON enrichment_jobs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- 4. AUTH TRIGGER: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, mission_statement, intent_type)
  VALUES (NEW.id, '', 'VALIDATION');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
