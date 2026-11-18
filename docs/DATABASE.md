# Database

UMunity stores accounts, sessions, memberships and all app data in a **Turso** database (hosted SQLite,
free tier). In development it uses a local SQLite file, so you can run the app without signing up for anything.

## Running locally

```bash
npm install
npm run dev
npm test
```

The first request creates `local.db` in the project root, builds the tables, and seeds the demo accounts,
memberships and join requests. `local.db` is git-ignored; delete it to start over.

**Password reset in development:** with no email service configured, the "Forgot password?" dialog shows
the reset link on screen (and the server log prints it).

## Going live

1. **Database.** Create a free account at <https://turso.tech>, install the CLI, then:

   ```bash
   turso db create umunity
   turso db show umunity --url
   turso db tokens create umunity
   ```

2. **Email (for password reset).** Create a free account at <https://resend.com>, verify a sending domain,
   and create an API key.

3. **Environment variables** (all listed in `.env.example`). Set them where the app runs.
   On Cloudflare, use `npx wrangler secret put NAME`. On Vercel, use Project → Settings → Environment Variables.

   | Variable | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://...` URL from step 1 |
   | `TURSO_AUTH_TOKEN` | the token from step 1 |
   | `APP_URL` | the public address, e.g. `https://umunity.example.edu.ph` (used in reset links) |
   | `RESEND_API_KEY` | the Resend API key |
   | `RESET_EMAIL_FROM` | a sender on your verified domain, e.g. `UMunity <no-reply@example.edu.ph>` |

Tables are created automatically on the first request. In production the app refuses to start without
`TURSO_DATABASE_URL` rather than silently writing to a file.

**Demo accounts are off in production.** Their passwords are printed on the sign-in page, so in production the
accounts are locked and the demo panel is hidden. Setting `ENABLE_DEMO_ACCOUNTS=true` turns them back on;
only use it for a throwaway classroom demo.

## Security

- **Passwords** are hashed with PBKDF2-SHA256 (100,000 iterations, random salt).
- **Sessions** are random tokens in an httpOnly, SameSite=Lax cookie (Secure on HTTPS); only a SHA-256 of the
  token is stored. "Remember me" keeps the session 30 days. Without it, the session ends with the browser
  (at most one day). Expired sessions are deleted whenever someone signs in.
- **Sign-in throttle:** 5 failed attempts for an email within 15 minutes locks that email for 15 minutes,
  and 20 failures from one IP locks the IP. A password reset lifts the email lock.
- **Password reset:** one-time link, valid 30 minutes. Using it signs out every session for that account.
  The "Forgot password?" answer is the same whether or not the email has an account.
- **Account management** (Settings / Profile → Account & security): change email, change password (signs out
  other devices) and delete account. Each needs the current password.
- **Who can change what:** the server checks each store against the signed-in role. Personal data is per
  account. Shared stores can only be written by the roles listed in `src/lib/synced-keys.ts`; for example,
  students can't touch workflows or review queues, and only admins can change the admin queues. Membership
  actions are checked individually: only students can request to join, and only that organization's leader
  (or an admin) can approve a request or manage its roster.
- **Review steps** (event workflows and closeouts, officer transitions, compliance, post approvals, event
  requirements) are checked step by step on the server (`src/lib/review-rules.ts`):
  - Only the organization's own leader creates, edits and submits an item, and edits only while it is a
    draft or sent back for revision.
  - Each pending stage can only be decided by its reviewer: adviser, then Admin 2, then Admin 1.
  - Reviewers decide and comment, but can't rewrite the submission.
  - Comments and history are append-only, and each new entry must be signed with the author's own role.
  - Only the owning leader or an admin can delete an item.
- **Same-item edits:** every stored item has a version. A save names the version it started from, and if
  someone else saved that item in the meantime, the whole save is refused. The app then shows "Someone else
  changed this at the same time" and loads the latest version, instead of silently overwriting it.

## How it fits together

| File | Role |
| --- | --- |
| `src/lib/db.server.ts` | Server-only. Connects to Turso, creates the schema, seeds or locks demo data, hashes passwords. |
| `src/lib/core.server.ts` | Server-only business logic (auth, throttle, reset, accounts, data, memberships). Takes the DB client, so tests run it against a throwaway database. |
| `src/lib/api.functions.ts` | Server functions the browser calls; thin wrappers over `core.server.ts` that handle cookies and errors. |
| `src/lib/synced-keys.ts` | The data stores kept in the database: scope, who may write, and item-level diffing. |
| `src/lib/review-rules.ts` | Which role may take which review step, checked on every save of an approval item. |
| `src/lib/seed-data.ts` | Starting data for the approval stores, written by the server the first time they load (demo mode only). |
| `src/lib/cloud-storage.ts` | Client adapter the stores use instead of `localStorage`: caches in the browser and saves changes to the database. |
| `src/lib/memberships.ts`, `membership-requests.ts` | Client side of the membership tables (optimistic updates with rollback). |
| `src/lib/*.test.ts` | Vitest suites: `npm test`. |

### Tables

| Table | Holds |
| --- | --- |
| `users` | email (unique), name, role, program, org, avatar colour, password hash |
| `sessions` | SHA-256 of the session token, user, expiry |
| `login_attempts` | failure counters and lockouts per email and per IP |
| `password_resets` | SHA-256 of the reset token, user, expiry, used time |
| `org_members` | organization, user, member-since, title (e.g. "Officer · VP"), Active/Inactive |
| `membership_requests` | organization, requesting user, reason, pending/approved/denied, who resolved it |
| `app_items` | one row per list item (or object field) of a synced store, with its position and version |
| `app_data` | synced stores whose value can't be split into items, stored whole |
| `meta` | one-off flags (e.g. demo data seeded) |

### Data flow

1. On entering a dashboard, the app checks the session cookie with the server and loads that account's data
   before rendering. A session faked in browser storage is rejected.
2. Stores read from the browser cache. Every write updates the cache immediately and is saved ~300 ms later.
   For lists and objects, only the items that changed are sent, so two people editing different items of the
   same store don't overwrite each other.
3. If the server refuses a save (a step your role can't take, or someone else changed the same item first),
   the change is dropped and the latest version is shown, with a message saying why.
4. If a save fails for a network reason, the app retries with back-off and shows "Some changes aren't saved yet" until it succeeds,
   and the browser warns before you close the tab with unsaved changes.
5. When the tab regains focus, the app re-loads from the database, so other people's changes show up.
6. Signing in or out clears the browser cache, so one account never sees another's data.

### Limits to know about

- When two people change the same item at once, the second person's change is refused, not merged; they
  redo it on the latest version.
- A save sent whole rather than item by item replaces the stored value without the version check. This
  only happens for a store's first save, or when converting data stored by an older version. The review
  rules still apply to it.
- Starting data for the approval stores is written only in demo mode. In production those stores start empty.
- Theme choice and unsent form drafts intentionally stay in the browser only.
