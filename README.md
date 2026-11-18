# UMunity

One platform for every student organization at the University of Mindanao.

## Getting started

```bash
npm install
npm run dev
npm test        # run the automated tests
```

Then open http://localhost:8080 (or the port Vite prints) and sign in with one of the demo accounts listed on the sign-in page.

## Database

Accounts, sessions and app data are stored in a free [Turso](https://turso.tech) database. Development needs no setup: the app creates `local.db` (SQLite) on first run. To deploy, set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `APP_URL`, and (for password-reset email) `RESEND_API_KEY` and `RESET_EMAIL_FROM`. Demo accounts are disabled in production. See [docs/DATABASE.md](docs/DATABASE.md) for setup and how it works.
