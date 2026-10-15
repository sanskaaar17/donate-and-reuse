import { createClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';
import { getE2EConfig } from '../scripts/e2e-config.js';

const config = getE2EConfig();
const testTitle = `E2E Donation ${Date.now()}`;

async function signIn(page, email, password) {
  await page.goto('/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Log In to Campus Account' }).click();
  await expect(page).toHaveURL(/\/explore$/);
}

async function signOut(page) {
  await page.goto('/profile');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /Log Out/ }).click();
  await expect(page).toHaveURL('/');
}

test('public browse, donate, request, donor-only acceptance, and dashboard status', async ({ browser }) => {
  test.setTimeout(120_000);
  let createdDonation = false;

  try {
    const donorContext = await browser.newContext();
    const donorPage = await donorContext.newPage();
    await signIn(donorPage, config.donorEmail, config.donorPassword);

    await donorPage.goto('/donate');
    await donorPage.locator('#title').fill(testTitle);
    await donorPage.locator('#category').selectOption('College Essentials');
    await donorPage.locator('#subcategory').selectOption('Textbooks & Reference Books');
    await donorPage.locator('#condition').selectOption('Gently Used');
    await donorPage.locator('#location').fill('Test campus library foyer');
    await donorPage.locator('#description').fill('Automated end-to-end listing for development verification.');
    createdDonation = true;
    await donorPage.getByRole('button', { name: 'Publish Donation Listing' }).click();
    await expect(donorPage.getByText('Listing Published to Database!')).toBeVisible();

    await signOut(donorPage);
    const visitorContext = await browser.newContext();
    const visitorPage = await visitorContext.newPage();
    await visitorPage.goto('/explore');
    const donationCard = visitorPage.locator('.donation-card').filter({ hasText: testTitle });
    await expect(donationCard).toBeVisible();
    await donationCard.getByRole('button', { name: `View details for ${testTitle}` }).click();
    const visitorDialog = visitorPage.getByRole('dialog');
    await expect(visitorDialog).toContainText(testTitle);
    await expect(visitorDialog).toContainText('Log in with your college account to request this item for free.');
    await visitorContext.close();

    const requesterContext = await browser.newContext();
    const requesterPage = await requesterContext.newPage();
    await signIn(requesterPage, config.requesterEmail, config.requesterPassword);
    await requesterPage.goto('/explore');
    const requesterCard = requesterPage.locator('.donation-card').filter({ hasText: testTitle });
    await expect(requesterCard).toBeVisible();
    await requesterCard.getByRole('button', { name: `View details for ${testTitle}` }).click();
    await requesterPage.getByRole('button', { name: 'Send Request to Donor' }).click();
    await expect(requesterPage.getByText('Request Sent to Donor!')).toBeVisible();
    await requesterPage.goto('/my-requests');
    await expect(requesterPage.getByRole('heading', { name: 'My Requests' })).toBeVisible();
    await expect(requesterPage.getByText(testTitle)).toBeVisible();
    await expect(requesterPage.getByText('Status: Pending')).toBeVisible();
    await signOut(requesterPage);

    await signIn(donorPage, config.donorEmail, config.donorPassword);
    await donorPage.goto('/my-donations');
    await expect(donorPage.getByRole('heading', { name: 'My Donations' })).toBeVisible();
    await expect(donorPage.getByText(testTitle)).toBeVisible();
    await donorPage.getByRole('button', { name: 'Accept Request' }).click();
    await donorPage.getByRole('button', { name: 'Confirm', exact: true }).click();
    const donorListing = donorPage.getByRole('heading', { name: testTitle }).locator('xpath=../../../../');
    await expect(donorListing.getByText('Reserved', { exact: true })).toBeVisible();
    await expect(donorListing.getByText('Accepted', { exact: true })).toBeVisible();

    await signIn(requesterPage, config.requesterEmail, config.requesterPassword);
    await requesterPage.goto('/my-requests');
    const requesterListing = requesterPage.getByRole('heading', { name: testTitle }).locator('xpath=../../..');
    await expect(requesterListing.getByText('Status: Accepted')).toBeVisible();
    await expect(requesterListing.getByText('Request Accepted by Donor!')).toBeVisible();

    await requesterPage.goto('/explore');
    const unavailableCard = requesterPage.locator('.donation-card').filter({ hasText: testTitle });
    await unavailableCard.getByRole('button', { name: `View details for ${testTitle}` }).click();
    await expect(requesterPage.getByRole('dialog')).toContainText('currently reserved and cannot accept new requests');

    await requesterContext.close();
    await donorContext.close();
  } finally {
    if (createdDonation) {
      const cleanupClient = createClient(config.url, config.key, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { error: signInError } = await cleanupClient.auth.signInWithPassword({
        email: config.donorEmail,
        password: config.donorPassword
      });
      if (signInError) throw new Error(`Could not sign in to clean up the development test listing: ${signInError.message}`);
      const { data: { user }, error: userError } = await cleanupClient.auth.getUser();
      if (userError || !user) throw new Error(`Could not identify the donor for test cleanup: ${userError?.message || 'No user'}`);
      const { error: cleanupError } = await cleanupClient
        .from('donations')
        .delete()
        .eq('donor_id', user.id)
        .eq('title', testTitle);
      if (cleanupError) throw new Error(`Could not clean up the development test listing: ${cleanupError.message}`);
    }
  }
});
