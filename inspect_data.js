// inspect_data.js
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  console.log('--- INSPECTING EXISTING PROFILES ---');
  const { data: profs } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profs);

  console.log('\n--- INSPECTING EXISTING DONATIONS ---');
  const { data: dons } = await supabase.from('donations').select('*');
  console.log('Donations:', dons);

  console.log('\n--- INSPECTING EXISTING REQUESTS ---');
  const { data: reqs } = await supabase.from('item_requests').select('*');
  console.log('Requests:', reqs);
}

inspect();
