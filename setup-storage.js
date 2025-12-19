#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 *
 * This script helps set up the required storage bucket for Re-Agent.
 * Run this after creating your Supabase project.
 *
 * Prerequisites:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login to Supabase: supabase login
 * 3. Link your project: supabase link --project-ref YOUR_PROJECT_REF
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up Supabase Storage for Re-Agent...\n');

// Check if supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI found');
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it:');
  console.error('   npm install -g supabase');
  process.exit(1);
}

// Check if project is linked
try {
  execSync('supabase status', { stdio: 'pipe' });
  console.log('✅ Supabase project linked');
} catch (error) {
  console.error('❌ Supabase project not linked. Please run:');
  console.error('   supabase link --project-ref YOUR_PROJECT_REF');
  process.exit(1);
}

try {
  console.log('📦 Creating storage bucket: project-images...');

  // Create the bucket
  execSync('supabase storage create project-images --public', { stdio: 'inherit' });

  console.log('✅ Bucket created successfully');

  console.log('🔒 Setting up bucket policies...');

  // Create a policy file for the bucket
  const policySQL = `
-- Allow public read access to project-images bucket
CREATE POLICY "Public read access for project-images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

-- Allow authenticated users to upload to project-images bucket
CREATE POLICY "Authenticated users can upload to project-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
`;

  fs.writeFileSync('storage-policies.sql', policySQL);

  // Apply the policies
  execSync('supabase db push', { stdio: 'inherit' });

  // Clean up
  fs.unlinkSync('storage-policies.sql');

  console.log('✅ Storage policies applied');
  console.log('');
  console.log('🎉 Storage setup complete!');
  console.log('');
  console.log('Your Re-Agent application should now work properly.');
  console.log('You can start uploading images to your projects.');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.error('');
  console.error('Manual Setup Instructions:');
  console.error('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/storage');
  console.error('2. Click "Create bucket"');
  console.error('3. Name: project-images');
  console.error('4. Check "Public bucket"');
  console.error('5. Create bucket');
  console.error('6. Go to Authentication > Policies and create the necessary RLS policies');
  process.exit(1);
}
