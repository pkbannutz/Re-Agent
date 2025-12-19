const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('Applying database migrations...');

  try {
    // Add missing columns to users table
    console.log('Updating users table...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_used BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
      `
    });

    // Add missing columns to projects table
    console.log('Updating projects table...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_description TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'pending';
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_images JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_log JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `
    });

    // Create trigger to update updated_at on projects
    console.log('Creating triggers...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    // Add missing columns to project_images table
    console.log('Updating project_images table...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE project_images ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE project_images ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';
        ALTER TABLE project_images ADD COLUMN IF NOT EXISTS ai_prompt_used TEXT;
        ALTER TABLE project_images ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}'::jsonb;
      `
    });

    // Create billing_log table
    console.log('Creating billing_log table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS billing_log (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'eur',
            stripe_payment_intent_id TEXT,
            package_type TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigrations();
