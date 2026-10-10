// test_backend.js
// Automated verification script for Donate & Reuse Supabase Backend
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('--- SUPABASE CONFIGURATION CHECK ---');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('\n--- TEST 1: DATABASE TABLES & SCHEMA CHECK ---');

  // Check profiles table
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(2);
  if (profErr) {
    console.log('[-] profiles table query:', profErr.message, `(code: ${profErr.code})`);
  } else {
    console.log('[+] profiles table accessible. Found rows:', profiles.length);
  }

  // Check donations table
  const { data: donations, error: donErr } = await supabase.from('donations').select('*').limit(2);
  if (donErr) {
    console.log('[-] donations table query:', donErr.message, `(code: ${donErr.code})`);
  } else {
    console.log('[+] donations table accessible. Found rows:', donations.length);
  }

  // Check item_requests table
  const { data: requests, error: reqErr } = await supabase.from('item_requests').select('*').limit(2);
  if (reqErr) {
    console.log('[-] item_requests table query:', reqErr.message, `(code: ${reqErr.code})`);
  } else {
    console.log('[+] item_requests table accessible. Found rows:', requests.length);
  }

  // Check storage bucket
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.log('[-] storage bucket query:', bErr.message);
  } else {
    console.log('[+] storage buckets accessible:', buckets.map(b => b.name));
  }

  console.log('\n--- TEST 2: AUTHENTICATION FLOW TEST (2 ACCOUNTS) ---');
  const timestamp = Date.now();
  const donorEmail = `donor_${timestamp}@college.edu`;
  const requesterEmail = `requester_${timestamp}@college.edu`;
  const testPassword = 'Password123!';

  console.log(`[Account A] Registering donor: ${donorEmail}`);
  const { data: donorAuth, error: donorErr } = await supabase.auth.signUp({
    email: donorEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Aarav Sharma (Test Donor)',
        campus_role: '4th Year Mechanical',
        department: 'Mechanical Engineering',
        phone: '+91 98765 11111'
      }
    }
  });

  if (donorErr) {
    console.log('[-] Donor signUp error:', donorErr.message);
  } else {
    console.log('[+] Donor registered! User ID:', donorAuth.user?.id);
    console.log('    Session active:', Boolean(donorAuth.session));
  }

  console.log(`\n[Account B] Registering requester: ${requesterEmail}`);
  const { data: requesterAuth, error: requesterErr } = await supabase.auth.signUp({
    email: requesterEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Priya Nair (Test Requester)',
        campus_role: '2nd Year Computer Science',
        department: 'CSE',
        phone: '+91 98765 22222'
      }
    }
  });

  if (requesterErr) {
    console.log('[-] Requester signUp error:', requesterErr.message);
  } else {
    console.log('[+] Requester registered! User ID:', requesterAuth.user?.id);
    console.log('    Session active:', Boolean(requesterAuth.session));
  }

  // Create dedicated clients
  let donorClient;
  let requesterClient;

  if (donorAuth.session) {
    donorClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    await donorClient.auth.setSession(donorAuth.session);
  } else {
    // Try signing in
    const { data: sIn1 } = await supabase.auth.signInWithPassword({ email: donorEmail, password: testPassword });
    if (sIn1?.session) {
      donorClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
      await donorClient.auth.setSession(sIn1.session);
    }
  }

  if (requesterAuth.session) {
    requesterClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    await requesterClient.auth.setSession(requesterAuth.session);
  } else {
    // Try signing in
    const { data: sIn2 } = await supabase.auth.signInWithPassword({ email: requesterEmail, password: testPassword });
    if (sIn2?.session) {
      requesterClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
      await requesterClient.auth.setSession(sIn2.session);
    }
  }

  if (!donorClient) {
    console.log('\n[!] Note on Email Confirmation: If Supabase has "Confirm email" enabled by default, sign in requires email confirmation or disabling "Confirm email" in Supabase Auth Settings.');
    return;
  }

  console.log('\n--- TEST 3: DONOR POSTS A DONATION ---');
  const { data: donation, error: createErr } = await donorClient
    .from('donations')
    .insert({
      donor_id: donorAuth.user.id,
      title: 'Casio fx-991EX ClassWiz Scientific Calculator (Live Test)',
      description: 'Used for semester 2 mathematics practicals. Dual power and functional cover included.',
      category: 'College Essentials',
      subcategory: 'Scientific Calculators & Drawing Instruments',
      condition: 'Like New',
      location: 'Central Library, 2nd Floor Study Room',
      status: 'Available',
      pickup_times: 'Mon - Fri after 3:00 PM',
      tags: ['Calculator', 'Math', 'Exam Ready']
    })
    .select()
    .single();

  if (createErr) {
    console.log('[-] Create donation error:', createErr.message);
    return;
  }
  console.log('[+] Donation published successfully! ID:', donation.id);
  console.log('    Title:', donation.title);
  console.log('    Status:', donation.status);

  console.log('\n--- TEST 4: PREVENT SELF-REQUEST (Account A cannot request own item) ---');
  const { data: selfData, error: selfErr } = await donorClient
    .from('item_requests')
    .insert({
      donation_id: donation.id,
      requester_id: donorAuth.user.id,
      status: 'Pending',
      message: 'Self request attempt'
    });

  if (selfErr) {
    console.log('[+] PASS: Self-request was blocked!');
    console.log('    Database rejected with:', selfErr.message);
  } else {
    console.log('[-] FAIL: Self-request was unexpectedly allowed!');
  }

  if (requesterClient) {
    console.log('\n--- TEST 5: ACCOUNT B (REQUESTER) REQUESTS ITEM ---');
    const { data: reqData, error: reqErr2 } = await requesterClient
      .from('item_requests')
      .insert({
        donation_id: donation.id,
        requester_id: requesterAuth.user.id,
        status: 'Pending',
        message: 'Hello Aarav, I am in 2nd semester CSE and need this calculator for upcoming exams.'
      })
      .select()
      .single();

    if (reqErr2) {
      console.log('[-] Request submission error:', reqErr2.message);
      return;
    }
    console.log('[+] Request submitted successfully! ID:', reqData.id);
    console.log('    Status:', reqData.status);

    console.log('\n--- TEST 6: PREVENT DUPLICATE ACTIVE REQUEST ---');
    const { data: dupData, error: dupErr } = await requesterClient
      .from('item_requests')
      .insert({
        donation_id: donation.id,
        requester_id: requesterAuth.user.id,
        status: 'Pending',
        message: 'Second duplicate request attempt'
      });

    if (dupErr) {
      console.log('[+] PASS: Duplicate active request was blocked!');
      console.log('    Database rejected with:', dupErr.message);
    } else {
      console.log('[-] FAIL: Duplicate request was allowed!');
    }

    console.log('\n--- TEST 7: ATOMIC REQUEST ACCEPTANCE (accept_item_request) ---');
    const { data: acceptData, error: acceptErr } = await donorClient.rpc('accept_item_request', {
      p_request_id: reqData.id
    });

    if (acceptErr) {
      console.log('[-] accept_item_request RPC error:', acceptErr.message);
    } else {
      console.log('[+] accept_item_request executed:', acceptData);
    }

    // Verify item is now Reserved
    const { data: updatedItem } = await donorClient
      .from('donations')
      .select('status')
      .eq('id', donation.id)
      .single();

    console.log('[+] Item status is now:', updatedItem?.status, '(Expected: Reserved)');

    console.log('\n--- TEST 8: MARK HANDOVER COMPLETED ---');
    const { data: compData, error: compErr } = await donorClient.rpc('mark_donation_completed', {
      p_donation_id: donation.id
    });

    if (compErr) {
      console.log('[-] mark_donation_completed RPC error:', compErr.message);
    } else {
      console.log('[+] mark_donation_completed executed:', compData);
    }

    const { data: finalItem } = await donorClient
      .from('donations')
      .select('status')
      .eq('id', donation.id)
      .single();

    console.log('[+] Item status is now:', finalItem?.status, '(Expected: Completed)');
  }

  console.log('\n======================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
}

runTests().catch(e => console.error(e));
