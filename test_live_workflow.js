// test_live_workflow.js
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

async function testWorkflow() {
  console.log('=== TEST SUITE: LIVE SUPABASE WORKFLOW ===\n');

  // 1. Test fetching donations with profile join (exactly what the frontend does)
  console.log('1. Testing donations fetch with profile join:');
  const { data: items, error: fetchErr } = await supabase
    .from('donations')
    .select(`
      *,
      profiles:donor_id (
        id,
        full_name,
        campus_role,
        department,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (fetchErr) {
    console.error('[-] Fetch error:', fetchErr.message);
    return;
  }
  console.log(`[+] Success! Retrieved ${items.length} live items from Supabase.`);
  const sample = items[0];
  console.log(`    Sample: "${sample.title}"`);
  console.log(`    Donor: ${sample.profiles?.full_name} (${sample.profiles?.campus_role})`);
  console.log(`    Status: ${sample.status}`);

  // 2. Test RPC functions exist in database
  console.log('\n2. Testing RPC accept_item_request exists:');
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const { data: rpcRes, error: rpcErr } = await supabase.rpc('accept_item_request', {
    p_request_id: dummyId
  });

  if (rpcErr) {
    // If function doesn't exist, code is 42883 or PGRST202
    if (rpcErr.code === 'PGRST202' || rpcErr.message.includes('Could not find')) {
      console.log('[-] RPC function accept_item_request NOT found in database.');
    } else {
      console.log('[-] RPC error:', rpcErr.message);
    }
  } else {
    console.log('[+] RPC accept_item_request exists and responded:', rpcRes);
  }

  // 3. Test RPC decline_item_request exists
  console.log('\n3. Testing RPC decline_item_request exists:');
  const { data: decRes, error: decErr } = await supabase.rpc('decline_item_request', {
    p_request_id: dummyId
  });
  if (decErr) {
    console.log('[-] RPC decline_item_request:', decErr.message);
  } else {
    console.log('[+] RPC decline_item_request exists and responded:', decRes);
  }

  // 4. Test RPC cancel_my_item_request exists
  console.log('\n4. Testing RPC cancel_my_item_request exists:');
  const { data: canRes, error: canErr } = await supabase.rpc('cancel_my_item_request', {
    p_request_id: dummyId
  });
  if (canErr) {
    console.log('[-] RPC cancel_my_item_request:', canErr.message);
  } else {
    console.log('[+] RPC cancel_my_item_request exists and responded:', canRes);
  }

  // 5. Test RPC mark_donation_completed exists
  console.log('\n5. Testing RPC mark_donation_completed exists:');
  const { data: compRes, error: compErr } = await supabase.rpc('mark_donation_completed', {
    p_donation_id: dummyId
  });
  if (compErr) {
    console.log('[-] RPC mark_donation_completed:', compErr.message);
  } else {
    console.log('[+] RPC mark_donation_completed exists and responded:', compRes);
  }

  // 6. Test RLS protection on unauthenticated insert
  console.log('\n6. Testing RLS protection on unauthenticated donation creation:');
  const { data: unauthDon, error: unauthErr } = await supabase
    .from('donations')
    .insert({
      donor_id: dummyId,
      title: 'Hacked Item Should Be Blocked By RLS',
      description: 'Attempting to insert without authentication',
      category: 'Other',
      subcategory: 'Other',
      condition: 'Functional / Fair',
      location: 'Unknown'
    });

  if (unauthErr) {
    console.log('[+] PASS: Unauthenticated insert was blocked by RLS policy!');
    console.log('    Security error:', unauthErr.message);
  } else {
    console.log('[-] FAIL: Unauthenticated insert succeeded!');
  }

  // 7. Test RLS protection on unauthenticated request creation
  console.log('\n7. Testing RLS protection on unauthenticated item request:');
  const { data: unauthReq, error: unauthReqErr } = await supabase
    .from('item_requests')
    .insert({
      donation_id: sample.id,
      requester_id: dummyId,
      status: 'Pending',
      message: 'Unauthenticated attempt'
    });

  if (unauthReqErr) {
    console.log('[+] PASS: Unauthenticated request was blocked by RLS policy!');
    console.log('    Security error:', unauthReqErr.message);
  } else {
    console.log('[-] FAIL: Unauthenticated request succeeded!');
  }

  console.log('\n=== LIVE TEST SUITE COMPLETE ===');
}

testWorkflow();
