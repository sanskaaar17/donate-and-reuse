// e2e_test.js
// End-to-end and RLS security test suite for Donate & Reuse.
// Runs entirely at the Supabase API level — no browser required.
// Tests DB security directly, not just frontend behavior.
//
import { createClient } from '@supabase/supabase-js';
import { getE2EConfig } from './scripts/e2e-config.js';

const config = getE2EConfig();
const {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,
  host: SUPABASE_HOST,
  donorEmail,
  donorPassword,
  requesterEmail,
  requesterPassword
} = config;

// ── Helpers ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function freshClient() {
  // Each client is independent (separate auth storage)
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function check(label, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS  ${label}`);
    passed++;
    results.push({ label, status: 'PASS' });
  } catch (err) {
    const msg = err.message || String(err);
    console.log(`  ❌ FAIL  ${label}`);
    console.log(`           ${msg}`);
    failed++;
    results.push({ label, status: 'FAIL', error: msg });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ── Shared state across tests ─────────────────────────────────────────────────
let donationId = null;
let requestId  = null;
const clientA  = freshClient();   // donor
const clientB  = freshClient();   // requester
const anonClient = freshClient(); // unauthenticated visitor

// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   DONATE & REUSE — END-TO-END + RLS SECURITY TEST SUITE     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── SECTION 1: PUBLIC BROWSE (unauthenticated) ────────────────────────────
  console.log('── 1. UNAUTHENTICATED VISITOR ──────────────────────────────────');

  await check('Anon visitor can fetch all available donations', async () => {
    const { data, error } = await anonClient
      .from('donations')
      .select('id, title, category, status, location')
      .order('created_at', { ascending: false })
      .limit(20);
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(Array.isArray(data), 'Expected array of donations');
    console.log(`           → ${data.length} donation(s) found`);
  });

  await check('Anon visitor can fetch donations with donor name (profile join)', async () => {
    const { data, error } = await anonClient
      .from('donations')
      .select('id, title, donor:profiles!donations_donor_id_fkey(id, full_name, campus_role)')
      .limit(5);
    assert(!error, `Join failed: ${error?.message}`);
    assert(Array.isArray(data), 'Expected array');
    console.log(`           → profile join works (${data.length} rows)`);
  });

  await check('Anon visitor CANNOT read item_requests (RLS blocks)', async () => {
    const { data, error } = await anonClient
      .from('item_requests')
      .select('*')
      .limit(5);
    // PostgREST returns empty data or error — either is acceptable
    // as long as no rows from other users leak
    const rowCount = data?.length ?? 0;
    assert(rowCount === 0 || error, 'RLS should return 0 rows or an error for anon requests table');
    console.log(`           → ${error ? 'error returned (correct)' : '0 rows returned (correct)'}`);
  });

  await check('Anon visitor CANNOT read profile email or phone columns', async () => {
    const { data, error } = await anonClient
      .from('profiles')
      .select('id, email, phone')
      .limit(1);
    assert(error, `Expected restricted profile columns to be denied; received ${data?.length ?? 0} row(s).`);
    console.log(`           → blocked: "${error.message.slice(0, 70)}"`);
  });

  await check('Anon visitor CANNOT create a donation (RLS blocks)', async () => {
    const { error } = await anonClient
      .from('donations')
      .insert({
        donor_id: '00000000-0000-0000-0000-000000000000',
        title: 'Unauthorized test item',
        description: 'This should not be created by an unauthenticated user.',
        category: 'Other',
        subcategory: 'General',
        condition: 'Gently Used',
        location: 'Test location',
        status: 'Available',
        pickup_times: 'Anytime'
      });
    assert(error, 'Expected RLS to block unauthenticated INSERT — no error was returned!');
    console.log(`           → blocked with: "${error.message.slice(0, 60)}..."`);
  });

  // ── SECTION 2: ACCOUNT A — SIGN IN AND DONATE ────────────────────────────
  console.log('\n── 2. ACCOUNT A (DONOR) ────────────────────────────────────────');

  await check('Account A can sign in', async () => {
    const { data, error } = await clientA.auth.signInWithPassword({
      email: donorEmail,
      password: donorPassword
    });
    assert(!error, `Sign-in failed: ${error?.message}`);
    assert(data.user?.id, 'Expected user object with id');
    console.log(`           → signed in as ${data.user.email} (${data.user.id.slice(0,8)}...)`);
  });

  await check('Account A can create a donation', async () => {
    const { data: { user } } = await clientA.auth.getUser();
    const title = `E2E Test Item ${Date.now()}`;
    const { data, error } = await clientA
      .from('donations')
      .insert({
        donor_id: user.id,
        title,
        description: 'Automated end-to-end test item. Safe to delete after the test.',
        category: 'College Essentials',
        subcategory: 'Textbooks & Reference Books',
        condition: 'Gently Used',
        location: 'Library foyer (E2E Test)',
        status: 'Available',
        pickup_times: 'Weekdays 4-6 PM',
        tags: ['e2e-test']
      })
      .select()
      .single();
    assert(!error, `Insert failed: ${error?.message}`);
    assert(data.id, 'Expected donation ID');
    donationId = data.id;
    console.log(`           → created donation "${title}" (${donationId.slice(0,8)}...)`);
  });

  await check('Account A CANNOT set donor_id to another user (RLS WITH CHECK)', async () => {
    const { error } = await clientA
      .from('donations')
      .insert({
        donor_id: '00000000-0000-0000-0000-000000000001',
        title: 'Spoofed donor item',
        description: 'Attempt to create a donation as another user.',
        category: 'Other',
        subcategory: 'General',
        condition: 'Gently Used',
        location: 'Test',
        status: 'Available',
        pickup_times: 'Anytime'
      });
    assert(error, 'Expected RLS WITH CHECK to block spoofed donor_id — no error!');
    console.log(`           → blocked with: "${error.message.slice(0, 60)}"`);
  });

  // ── SECTION 3: ACCOUNT B — SIGN IN AND REQUEST ───────────────────────────
  console.log('\n── 3. ACCOUNT B (REQUESTER) ────────────────────────────────────');

  await check('Account B can sign in', async () => {
    const { data, error } = await clientB.auth.signInWithPassword({
      email: requesterEmail,
      password: requesterPassword
    });
    assert(!error, `Sign-in failed: ${error?.message}`);
    assert(data.user?.id, 'Expected user object with id');
    console.log(`           → signed in as ${data.user.email} (${data.user.id.slice(0,8)}...)`);
  });

  await check('Account B can see the donation created by Account A', async () => {
    assert(donationId, 'No donation ID from previous test');
    const { data, error } = await clientB
      .from('donations')
      .select('id, title, status, donor:profiles!donations_donor_id_fkey(full_name)')
      .eq('id', donationId)
      .single();
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(data.status === 'Available', `Expected Available, got ${data.status}`);
    console.log(`           → sees "${data.title}" offered by ${data.donor?.full_name}`);
  });

  await check('Account B can request the donation', async () => {
    assert(donationId, 'No donation ID from previous test');
    const { data: { user } } = await clientB.auth.getUser();
    const { data, error } = await clientB
      .from('item_requests')
      .insert({
        donation_id: donationId,
        requester_id: user.id,
        status: 'Pending',
        message: 'E2E test request — automated.'
      })
      .select()
      .single();
    assert(!error, `Request failed: ${error?.message}`);
    assert(data.id, 'Expected request ID');
    requestId = data.id;
    console.log(`           → request created (${requestId.slice(0,8)}...)`);
  });

  await check('Account B CANNOT submit a duplicate active request', async () => {
    assert(donationId, 'No donation ID');
    const { data: { user } } = await clientB.auth.getUser();
    const { error } = await clientB
      .from('item_requests')
      .insert({
        donation_id: donationId,
        requester_id: user.id,
        status: 'Pending',
        message: 'Duplicate request attempt.'
      });
    assert(error, 'Expected unique index to block duplicate active request — no error!');
    console.log(`           → blocked (unique index): "${error.message.slice(0, 60)}"`);
  });

  await check('Account B CANNOT change their request status directly', async () => {
    assert(requestId, 'No request ID');
    const { error } = await clientB
      .from('item_requests')
      .update({ status: 'Accepted' })
      .eq('id', requestId);
    assert(error, 'Expected table privileges/RLS to block direct request status updates.');
    console.log(`           → blocked: "${error.message.slice(0, 70)}"`);
  });

  await check('Account B CANNOT change or delete Account A\'s donation', async () => {
    assert(donationId, 'No donation ID');
    const { error: updateError } = await clientB
      .from('donations')
      .update({ status: 'Completed' })
      .eq('id', donationId);
    assert(updateError, 'Expected donation status update to be denied.');
    const { data, error: deleteError } = await clientB
      .from('donations')
      .delete()
      .eq('id', donationId)
      .select('id');
    assert(deleteError || data?.length === 0, 'Expected deletion of another user\'s donation to be denied.');
    console.log('           → foreign listing update and deletion blocked');
  });

  await check('Account B CANNOT request their own donation (if they had one)', async () => {
    // This is enforced by check_request_eligibility() trigger.
    // We test by Account A trying to request the item they created.
    const { data: { user } } = await clientA.auth.getUser();
    const { error } = await clientA
      .from('item_requests')
      .insert({
        donation_id: donationId,
        requester_id: user.id,
        status: 'Pending',
        message: 'Self-request attempt.'
      });
    assert(error, 'Expected trigger to block self-request — no error!');
    assert(
      error.message.includes('own donation') || error.message.includes('cannot request'),
      `Expected self-request error, got: "${error.message}"`
    );
    console.log(`           → blocked by trigger: "${error.message.slice(0, 60)}"`);
  });

  // ── SECTION 4: AUTHORIZATION — ONLY DONOR CAN ACCEPT ────────────────────
  console.log('\n── 4. AUTHORIZATION ENFORCEMENT ───────────────────────────────');

  await check('Account B (requester) CANNOT accept their own request via RPC', async () => {
    assert(requestId, 'No request ID');
    const { data, error } = await clientB.rpc('accept_item_request', {
      p_request_id: requestId
    });
    const blocked = error || !data?.success;
    assert(blocked, 'Expected RPC to reject non-donor acceptance — succeeded unexpectedly!');
    const reason = error?.message || data?.error || 'success=false';
    console.log(`           → blocked: "${reason}"`);
  });

  await check('Account A (donor) CAN accept the request via RPC', async () => {
    assert(requestId, 'No request ID');
    const { data, error } = await clientA.rpc('accept_item_request', {
      p_request_id: requestId
    });
    assert(!error, `RPC error: ${error?.message}`);
    assert(data?.success, `RPC returned failure: ${data?.error}`);
    console.log(`           → accepted: "${data.message}"`);
  });

  await check('Donation status is now Reserved (atomic update confirmed)', async () => {
    assert(donationId, 'No donation ID');
    const { data, error } = await anonClient
      .from('donations')
      .select('status')
      .eq('id', donationId)
      .single();
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(data.status === 'Reserved', `Expected Reserved, got "${data.status}"`);
    console.log(`           → status = "${data.status}" ✓`);
  });

  await check('Request status is now Accepted', async () => {
    assert(requestId, 'No request ID');
    const { data, error } = await clientA
      .from('item_requests')
      .select('status')
      .eq('id', requestId)
      .single();
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(data.status === 'Accepted', `Expected Accepted, got "${data.status}"`);
    console.log(`           → status = "${data.status}" ✓`);
  });

  await check('Account B CANNOT request a Reserved item', async () => {
    const { data: { user } } = await clientB.auth.getUser();
    const { error } = await clientB
      .from('item_requests')
      .insert({
        donation_id: donationId,
        requester_id: user.id,
        status: 'Pending',
        message: 'Late request on reserved item.'
      });
    assert(error, 'Expected trigger to block request on Reserved item — no error!');
    console.log(`           → blocked: "${error.message.slice(0, 60)}"`);
  });

  // ── SECTION 5: CONTACT PRIVACY ────────────────────────────────────────────
  console.log('\n── 5. CONTACT PRIVACY (RPC GATE) ───────────────────────────────');

  await check('Both parties can get contact details via RPC after acceptance', async () => {
    assert(requestId, 'No request ID');
    const { data: donorView, error: e1 } = await clientA.rpc('get_accepted_request_contact', {
      p_request_id: requestId
    });
    const { data: requesterView, error: e2 } = await clientB.rpc('get_accepted_request_contact', {
      p_request_id: requestId
    });
    assert(!e1, `Donor view failed: ${e1?.message}`);
    assert(!e2, `Requester view failed: ${e2?.message}`);
    assert(donorView?.requester || donorView?.donor, 'Expected contact object from donor view');
    console.log(`           → donor sees requester contact: ${JSON.stringify(donorView?.requester)}`);
    console.log(`           → requester sees donor contact: ${JSON.stringify(requesterView?.donor)}`);
  });

  await check('Anon user CANNOT get contact details via RPC', async () => {
    assert(requestId, 'No request ID');
    const { data } = await anonClient.rpc('get_accepted_request_contact', {
      p_request_id: requestId
    });
    // RPC returns {} for unauthorized callers, not actual contact data
    const hasContact = data && (data.donor?.email || data.requester?.email);
    assert(!hasContact, `Expected empty result, got contact data: ${JSON.stringify(data)}`);
    console.log(`           → returned: ${JSON.stringify(data)} (no contact data exposed) ✓`);
  });

  // ── SECTION 6: DASHBOARD STATE VERIFICATION ──────────────────────────────
  console.log('\n── 6. DASHBOARD STATE ──────────────────────────────────────────');

  await check("Account A's My Donations shows the item as Reserved", async () => {
    const { data: { user } } = await clientA.auth.getUser();
    const { data, error } = await clientA
      .from('donations')
      .select('title, status, item_requests(id, status)')
      .eq('donor_id', user.id)
      .eq('id', donationId)
      .single();
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(data.status === 'Reserved', `Expected Reserved, got ${data.status}`);
    const accepted = data.item_requests?.find(r => r.status === 'Accepted');
    assert(accepted, 'Expected at least one Accepted request in the list');
    console.log(`           → donation=Reserved, accepted request count=${data.item_requests.length} ✓`);
  });

  await check("Account B's My Requests shows the request as Accepted", async () => {
    const { data: { user } } = await clientB.auth.getUser();
    const { data, error } = await clientB
      .from('item_requests')
      .select('status, donation:donations!item_requests_donation_id_fkey(title, status)')
      .eq('requester_id', user.id)
      .eq('id', requestId)
      .single();
    assert(!error, `Fetch failed: ${error?.message}`);
    assert(data.status === 'Accepted', `Expected Accepted, got ${data.status}`);
    assert(data.donation?.status === 'Reserved', `Expected donation Reserved, got ${data.donation?.status}`);
    console.log(`           → request=Accepted, item=Reserved ✓`);
  });

  await check('Account B CANNOT read requests belonging to other users', async () => {
    // Try to read all requests without filtering — RLS should only return B's own
    const { data: { user: userB } } = await clientB.auth.getUser();
    const { data, error } = await clientB
      .from('item_requests')
      .select('id, requester_id, donation:donations!item_requests_donation_id_fkey(donor_id)')
      .limit(50);
    assert(!error, `Unexpected error: ${error?.message}`);
    // Every returned row must either belong to B or be for B's donated items
    const leak = (data || []).filter(r => {
      const isRequester = r.requester_id === userB.id;
      const isDonor = r.donation?.donor_id === userB.id;
      return !isRequester && !isDonor;
    });
    assert(leak.length === 0, `RLS leaked ${leak.length} request(s) belonging to other users!`);
    console.log(`           → ${data?.length ?? 0} row(s) returned, all belong to Account B ✓`);
  });

  // ── SECTION 7: STORAGE RLS ───────────────────────────────────────────────
  console.log('\n── 7. STORAGE PERMISSIONS ──────────────────────────────────────');

  await check('Account A CANNOT upload into Account B\'s storage folder', async () => {
    const { data: { user: userB } } = await clientB.auth.getUser();
    const fakePath = `${userB.id}/hacked-image.png`;
    const fakeBytes = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
    const { error } = await clientA.storage
      .from('donation-images')
      .upload(fakePath, fakeBytes, { contentType: 'image/png', upsert: false });
    assert(error, 'Expected Storage RLS to block cross-user upload — no error!');
    console.log(`           → blocked: "${error.message.slice(0, 70)}"`);
  });

  await check('Anon visitor CANNOT upload to storage', async () => {
    const fakePath = `anon-user/test.png`;
    const fakeBytes = new Uint8Array([137, 80, 78, 71]);
    const { error } = await anonClient.storage
      .from('donation-images')
      .upload(fakePath, fakeBytes, { contentType: 'image/png', upsert: false });
    assert(error, 'Expected Storage RLS to block anon upload — no error!');
    console.log(`           → blocked: "${error.message.slice(0, 70)}"`);
  });

  await check('Account A CAN upload and remove an image from their own folder', async () => {
    const { data: { user } } = await clientA.auth.getUser();
    const path = `${user.id}/e2e-${Date.now()}.png`;
    const pngBytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=',
      'base64'
    );
    const { error: uploadError } = await clientA.storage
      .from('donation-images')
      .upload(path, pngBytes, { contentType: 'image/png', upsert: false });
    assert(!uploadError, `Own-folder upload failed: ${uploadError?.message}`);
    const { error: removeError } = await clientA.storage.from('donation-images').remove([path]);
    assert(!removeError, `Own-folder cleanup failed: ${removeError?.message}`);
  });

  await check('Account A CANNOT upload a disallowed image type', async () => {
    const { data: { user } } = await clientA.auth.getUser();
    const path = `${user.id}/e2e-${Date.now()}.svg`;
    const { error } = await clientA.storage
      .from('donation-images')
      .upload(path, Buffer.from('<svg/>'), { contentType: 'image/svg+xml', upsert: false });
    assert(error, 'Expected the Storage bucket MIME allowlist to reject SVG.');
    console.log(`           → rejected: "${error.message.slice(0, 70)}"`);
  });

  // ── CLEANUP ───────────────────────────────────────────────────────────────
  console.log('\n── 8. CLEANUP ──────────────────────────────────────────────────');

  await check('Account A can delete the test donation (cascade-deletes requests)', async () => {
    assert(donationId, 'No donation ID');
    const { data: { user } } = await clientA.auth.getUser();
    // Note: deleting a Reserved donation — RLS only checks donor_id
    const { error } = await clientA
      .from('donations')
      .delete()
      .eq('id', donationId)
      .eq('donor_id', user.id);
    assert(!error, `Delete failed: ${error?.message}`);
    console.log(`           → test donation and its requests deleted ✓`);
  });

  // ── REPORT ────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST REPORT                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total:  ${String(passed + failed).padEnd(4)} │  Passed: ${String(passed).padEnd(4)} │  Failed: ${String(failed).padEnd(20)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.label}`);
      console.log(`     ${r.error}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed. The platform is functionally and security-verified.\n');
  }
}

console.log(`Using explicitly configured development Supabase project: ${SUPABASE_HOST}`);
runTests().catch(err => {
  console.error('\n💥 Unhandled test runner error:', err.message);
  process.exit(1);
});
