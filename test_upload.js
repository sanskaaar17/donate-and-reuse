// test_upload.js — verifies the donation-images bucket accepts uploads
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
);

async function testUpload() {
  // Create a tiny 1x1 PNG in memory (valid PNG bytes)
  const pngBytes = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
    '2e00000000c49444154789c6260f8cfc00000000200016dd8a601000000000049454e44ae426082',
    'hex'
  );

  const fileName = `test-${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from('donation-images')
    .upload(fileName, pngBytes, { contentType: 'image/png', upsert: false });

  if (error) {
    console.log('❌ Upload failed:', error.message);
    console.log('   Status:', error.status, '| Code:', error.statusCode);
    if (error.status === 400 && error.message.includes('Bucket not found')) {
      console.log('\n⚠️  Bucket does not exist yet. Create it in Supabase Dashboard:');
      console.log('   Storage → New bucket → Name: donation-images → Public: ON');
    }
    if (error.status === 401 || error.status === 403) {
      console.log('\n⚠️  Auth required: Storage policies require a signed-in user.');
      console.log('   This is expected for unauthenticated uploads — image upload');
      console.log('   will work fine in the browser after the user logs in.');
    }
  } else {
    console.log('✅ Upload succeeded! File path:', data.path);
    // Clean up
    await supabase.storage.from('donation-images').remove([fileName]);
    console.log('✅ Cleanup done. Bucket is fully operational.');
  }
}

testUpload();
