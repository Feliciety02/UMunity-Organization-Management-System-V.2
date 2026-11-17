# Database

UMunity stores accounts, sessions and all app data in a **Turso** database (hosted SQLite, free tier).
In development it uses a local SQLite file, so you can run the app without signing up for anything.

## Running locally

```bash
npm install
npm run dev
```

The first request creates `local.db` in the project root, builds the tables, and seeds the six demo
accounts shown on the sign-in page. `local.db` is git-ignored; delete it to start over.

## Going live on Turso (free)

1. Create a free account at <https://turso.tech> and install the CLI.
2. Create a database and a token:

   ```bash
   turso db create umunity
   turso db show umunity --url
   turso db tokens create umunity
   ```

3. Set two environment variables where the app runs (`.env.example` lists them; to point local
   development at Turso instead of `local.db`, set them in your shell before `npm run dev`):

   | Variable | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://...` URL from step 2 |
   | `TURSO_AUTH_TOKEN` | the token from step 2 |

   - **Cloudflare:** `npx wrangler secret put TURSO_DATABASE_URL` and the same for `TURSO_AUTH_TOKEN`.
   - **Vercel:** Project → Settings → Environment Variables.

The tables are created and the demo accounts seeded automatically on the first request. In production
the app refuses to start without `TURSO_DATABASE_URL`, rather than silently writing to a file.

## How it fits together

| File | Role |
| --- | --- |
| `src/lib/db.server.ts` | Server-only. Connects to Turso, creates the schema, seeds demo accounts, hashes passwords (PBKDF2-SHA256). |
| `src/lib/api.functions.ts` | Server functions the browser calls: `loginFn`, `registerFn`, `logoutFn`, `meFn`, `loadDataFn`, `saveDataFn`. |
| `src/lib/synced-keys.ts` | The list of data stores kept in the database, and whether each is per-user or shared. |
| `src/lib/cloud-storage.ts` | Client adapter the stores use instead of `localStorage`: caches in the browser, saves to the database. |

### Tables

- **`users`**: email (unique), name, role, program, org, avatar colour, password hash.
- **`sessions`**: SHA-256 of the session token, user, expiry. The token itself only lives in the
  `umunity_sid` cookie (httpOnly, SameSite=Lax, Secure on HTTPS): 30 days with "Remember me",
  otherwise until the browser closes (and at most one day).
- **`app_data`**: one JSON value per store, keyed by `scope` + `key`. Scope is `user:<id>` for personal
  data (memberships, saved items, messages, RSVPs, settings, profile) or `shared` for campus-wide data
  (notifications, review queues, org records, compliance, event workflows, membership requests).

### Data flow

1. On entering a dashboard, the app checks the session cookie with the server (`meFn`) and loads that
   account's data (`loadDataFn`) before rendering. A session faked in browser storage is rejected.
2. Stores read from the browser cache as before; every write updates the cache immediately and is saved
   to the database ~300 ms later (`saveDataFn`).
3. When the tab regains focus, the app re-loads from the database, so changes made by other people
   (for example an admin approving an event) show up.
4. Signing in or out clears the browser cache, so one account never sees another's data.

### Limits to know about

- Each store is saved as a whole JSON document. If two people edit the **same shared store** at the same
  moment, the later save wins. That's fine at demo scale; for heavy concurrent use, move the busiest
  stores (workflows, notifications) to their own tables with row-level updates.
- Shared stores accept writes from any signed-in user; the UI decides who sees which actions. Add
  role checks in `saveDataFn` before relying on this for real moderation.
- Theme choice and unsent form drafts intentionally stay in the browser only.
