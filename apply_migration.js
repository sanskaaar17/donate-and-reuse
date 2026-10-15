// apply_migration.js
// Reads a SQL migration file and prints it ready to paste into Supabase SQL Editor.
// Usage: node apply_migration.js supabase/migrations/002_fix_profiles_join_permission.sql
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node apply_migration.js <path-to-sql-file>');
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf-8');
console.log('\n========================================');
console.log('COPY THE SQL BELOW INTO SUPABASE SQL EDITOR');
console.log('Dashboard → SQL Editor → New query → Paste → Run');
console.log('========================================\n');
console.log(sql);
console.log('\n========================================\n');
