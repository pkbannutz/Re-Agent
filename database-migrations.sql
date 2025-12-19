-- Database schema updates for Re-Agent platform
-- Run these migrations in Supabase SQL editor or via CLI

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_used BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_log JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns to project_images table
ALTER TABLE project_images ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE project_images ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';
ALTER TABLE project_images ADD COLUMN IF NOT EXISTS ai_prompt_used TEXT;
ALTER TABLE project_images ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}'::jsonb;

-- Create billing_log table for tracking payments and usage
CREATE TABLE IF NOT EXISTS billing_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'eur',
    stripe_payment_intent_id TEXT,
    package_type TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'overage'
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_subscriptions table for tracking subscription usage
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    plan_type TEXT NOT NULL, -- 'unlimited'
    projects_used INTEGER DEFAULT 0,
    projects_limit INTEGER DEFAULT 30,
    billing_cycle_start TIMESTAMP WITH TIME ZONE,
    billing_cycle_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for user_subscriptions updated_at
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create video_generations table for tracking video creation
CREATE TABLE IF NOT EXISTS video_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    video_url TEXT,
    aspect_ratio TEXT, -- '9:16' or '16:9'
    duration_seconds INTEGER DEFAULT 60,
    clips_count INTEGER DEFAULT 12,
    music_track TEXT,
    logo_used BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create share_links table for public video sharing
CREATE TABLE IF NOT EXISTS share_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create processing_queue table for async processing
CREATE TABLE IF NOT EXISTS processing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    image_id UUID REFERENCES project_images(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL, -- 'initial_processing', 'tweak', 'video_generation'
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_log_user_id ON billing_log(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_log_project_id ON billing_log(project_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_project_id ON video_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON processing_queue(priority DESC);

-- Enable Row Level Security on new tables
ALTER TABLE billing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_log
CREATE POLICY "Users can view their own billing logs" ON billing_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage billing logs" ON billing_log
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for video_generations
CREATE POLICY "Users can view video generations for their projects" ON video_generations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = video_generations.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage video generations" ON video_generations
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for share_links
CREATE POLICY "Users can view share links for their projects" ON share_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = share_links.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view active share links" ON share_links
    FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Service role can manage share links" ON share_links
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for processing_queue
CREATE POLICY "Users can view processing queue for their projects" ON processing_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = processing_queue.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage processing queue" ON processing_queue
    FOR ALL USING (auth.role() = 'service_role');

-- Insert initial data for existing users to get free trial
INSERT INTO users (id, email, created_at, free_trial_used)
SELECT
    u.id,
    u.email,
    u.created_at,
    FALSE as free_trial_used
FROM auth.users u
LEFT JOIN users existing_u ON existing_u.id = u.id
WHERE existing_u.id IS NULL
ON CONFLICT (id) DO NOTHING;
