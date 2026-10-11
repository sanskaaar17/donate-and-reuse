# Donate & Reuse

A React 18 + Vite campus exchange application. The existing frontend and design system are retained; donation listings, requests, profiles, and authentication are integrated with Supabase.

## Folder structure

```text
donate-and-reuse/
├── index.html
├── package.json
├── .env.example
├── README.md
├── supabase/
│   ├── schema.sql       # Tables, validation, RLS, RPCs, and Storage policies
│   └── seed.sql         # Optional sample listings for a registered profile
└── src/
    ├── App.jsx
    ├── components/      # Existing shared UI and route guard
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ItemsContext.jsx
    ├── data/
    │   └── demoData.js  # Form choices and static site content only (no sample listings)
    ├── lib/
    │   └── supabase.js
    ├── pages/           # Existing routes including Explore, Donate, and account dashboards
    └── styles/          # Existing CSS design system, unchanged
```

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste all of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates `profiles`, `donations`, and `item_requests`, their validation and RLS rules, request RPCs, and the public image bucket with upload restrictions.
3. In **Project Settings → API**, copy the Project URL and the browser-safe publishable key (or legacy anon key).
4. Copy `.env.example` to `.env` and fill in the values:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   `VITE_SUPABASE_ANON_KEY` is accepted for legacy anon keys. Never use a `service_role` or secret key in a `VITE_` variable or browser code.
5. In **Authentication → URL Configuration**, set `http://localhost:3000` as a Site URL and add both `http://localhost:3000` and `http://localhost:3000/reset-password` as allowed redirect URLs. Email confirmation can remain enabled; users must confirm their email before sign-in if it is required by your project.
6. Restart Vite after changing `.env`.

The SQL file is designed for a new project and replaces the policies created by the earlier Phase 2 attempt. Re-running the file is safe for the current table/policy/function names. Back up existing data before applying schema changes to a populated project. The optional `supabase/seed.sql` inserts sample donations for an already-registered profile; run it only when demo listings are useful.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:3000`. Production build:

```bash
npm run build
npm run preview
```

## Backend overview (viva)

- Supabase Auth verifies email/password and persists the browser session. React listens for login, logout, refresh, and expired-session changes; protected routes send signed-out visitors to Login.
- PostgreSQL stores profile, donation, and request rows. The browser receives only a publishable key; Row Level Security uses `auth.uid()` to identify the current user and restricts each operation.
- Donation categories, the eight College Essentials subcategories, conditions, required fields, and request statuses are checked in the database as well as validated in the form.
- Request creation is checked by a database trigger, which rejects self-requests, unavailable listings, and spoofed requester IDs. A partial unique index prevents duplicate active requests.
- Accepting a request calls a PostgreSQL function inside one transaction. It locks the donation row, checks the caller is its owner, accepts one pending request, declines other pending requests, and reserves the donation. A unique index also prevents more than one accepted request per item.
- Contact details are not available from public profile queries. A security-definer function returns them to the donor/requester only for an accepted request.
- Optional images are stored in Supabase Storage under the signed-in user's folder. The bucket enforces a 5MB limit and JPG/PNG/WebP MIME types; Storage policies restrict uploads and changes to that user's folder.

## Manual testing checklist

Use two independent browser profiles (or one normal and one private window), and create accounts **A** and **B**.

1. Register A and B with different email addresses. Confirm email if enabled, log in, refresh, and verify the session remains active. Log out and confirm protected routes redirect to Login.
2. As A, publish a donation in each flow you want to check, including College Essentials and each of its eight subcategories. Verify the category/subcategory/condition and required-field validation; try a JPG/PNG/WebP image under 5MB and a rejected type/oversized image.
3. As a signed-out visitor, browse, search, and filter live donations. Verify the home/explore/College Essentials pages show the database rows and a meaningful empty or connection error when none are available.
4. As A, open A's own listing and attempt to request it. The interface and database must reject the self-request.
5. As B, request A's available item. Submit a second active request from B for that same item; it must be rejected. Verify B sees it in My Requests and A sees it in My Donations.
6. As an unrelated/unauthorized account, try to accept/decline A's request or update/delete A's donation. These operations must fail. Public pages should not reveal profile phone/email.
7. As A, accept B's request. Confirm the item becomes Reserved atomically, other pending requests become Declined, B sees contact details only after acceptance, and a second request/acceptance cannot reserve the item again.
8. As A, decline a different pending request and verify it is reflected for the requester. Complete a reserved handover and verify the listing becomes Completed.
9. Cancel a pending request as its requester, delete an owned listing, and confirm both dashboards refresh. Try direct browser reloads on protected routes after logging out and after the auth session expires.

This repository has no automated test script configured. `npm run build` is the available repository-level verification command; the two-account and database-policy checks above require an actual Supabase project and must be run manually.
