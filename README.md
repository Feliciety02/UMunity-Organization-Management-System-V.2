# UMunity

One platform for every student organization at the University of Mindanao.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:8080 (or the port Vite prints) and sign in with one of the demo accounts listed on the sign-in page.

## Database

Accounts, sessions and app data are stored in a free [Turso](https://turso.tech) database. Development needs no setup: the app creates `local.db` (SQLite) on first run. To deploy, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. See [docs/DATABASE.md](docs/DATABASE.md) for setup and how it works.
