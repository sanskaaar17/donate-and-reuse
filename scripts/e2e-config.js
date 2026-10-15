import fs from 'node:fs';
import path from 'node:path';

function readEnvFile(fileName) {
  const filePath = path.resolve(fileName);
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      })
  );
}

const appEnv = readEnvFile('.env');
const testEnv = readEnvFile('.env.e2e.local');
const value = (key) => process.env[key] || testEnv[key] || '';

export function getE2EConfig() {
  const url = value('E2E_SUPABASE_URL');
  const key = value('E2E_SUPABASE_PUBLISHABLE_KEY') || value('E2E_SUPABASE_ANON_KEY');
  const donorEmail = value('E2E_DONOR_EMAIL');
  const donorPassword = value('E2E_DONOR_PASSWORD');
  const requesterEmail = value('E2E_REQUESTER_EMAIL');
  const requesterPassword = value('E2E_REQUESTER_PASSWORD');

  if (value('E2E_TARGET') !== 'development') {
    throw new Error('Set E2E_TARGET=development in .env.e2e.local. Test runs are refused unless explicitly marked as development.');
  }
  if (!url || !key || !donorEmail || !donorPassword || !requesterEmail || !requesterPassword) {
    throw new Error('Configure E2E_SUPABASE_URL, E2E_SUPABASE_PUBLISHABLE_KEY (or E2E_SUPABASE_ANON_KEY), E2E_DONOR_EMAIL/PASSWORD, and E2E_REQUESTER_EMAIL/PASSWORD in .env.e2e.local.');
  }

  const testUrl = new URL(url);
  if (testUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(testUrl.hostname)) {
    throw new Error('E2E_SUPABASE_URL must use HTTPS (or localhost for a local Supabase instance).');
  }
  const testHost = testUrl.host;
  const appHost = appEnv.VITE_SUPABASE_URL ? new URL(appEnv.VITE_SUPABASE_URL).host : null;
  if (appHost && testHost === appHost) {
    throw new Error('E2E target matches the project in .env. Use a separate development Supabase project; this test creates and deletes test records.');
  }
  if (donorEmail.toLowerCase() === requesterEmail.toLowerCase()) {
    throw new Error('The donor and requester test accounts must be different users.');
  }

  return {
    url,
    key,
    host: testHost,
    donorEmail,
    donorPassword,
    requesterEmail,
    requesterPassword
  };
}

export function getAppUrl() {
  const baseURL = value('E2E_BASE_URL') || 'http://127.0.0.1:3010';
  return new URL(baseURL).origin;
}
