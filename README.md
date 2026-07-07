# NutriMeet

React + TypeScript frontend with an Express API backed by Neon/PostgreSQL.

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Create a local `.env`.

```powershell
Copy-Item .env.example .env
```

For persistent data, set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require&channel_binding=require"
ADMIN_TOKEN_SECRET="use-a-long-random-secret"
```

If these values are omitted, the app still starts and the default admin login works using an in-memory database fallback. That fallback is useful for first deploys and emergency access, but it does not persist data between serverless cold starts.

3. Create the Neon/PostgreSQL schema and seed the admin account.

```bash
npm run init-db
```

To recreate an empty database from scratch:

```bash
npm run init-db -- --reset
```

4. Start the API server.

```bash
npm run start:server
```

5. Start the frontend.

```bash
npm run dev
```

## Database

The app no longer uses `data/db.sqlite` or `sql.js`. Persistent data lives in PostgreSQL/Neon when `DATABASE_URL` is configured. Without `DATABASE_URL`, the API uses an in-memory Postgres-compatible fallback.

`npm run init-db` creates these tables:

- `admins`
- `nutritionists`
- `subscriptions`
- `lists`
- `testimonials`
- `faqs`

The default NutriMeet admin is seeded with the configured admin email and a bcrypt password hash. If `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `ADMIN_PASSWORD_HASH` are not provided, the seed uses the requested default admin account.

## Deployment

### Vercel

For production persistence, set these environment variables in Vercel:

- `DATABASE_URL`
- `ADMIN_TOKEN_SECRET`, recommended for a custom admin session secret
- `GEMINI_API_KEY`, only if AI features are used
- `APP_URL`, if callbacks or absolute links need it

If no variables are configured in Vercel, admin login still works with the built-in admin seed and in-memory database fallback, but saved data is temporary.

The Vercel function in `api/[...slug].cjs` reuses the same Express app from `server/app.cjs`, so local API behavior and serverless behavior stay aligned.

### Hostinger

Use the same `.env` values in the Hostinger Node.js environment:

- `DATABASE_URL`
- `ADMIN_TOKEN_SECRET`
- `PORT`, if Hostinger assigns a specific port

Run `npm run init-db` once against the Neon database before opening the app to users.

## Admin API Endpoints

- `POST /api/admin/login`
- `PUT /api/subscriptions/:id/status`
- `PUT /api/nutritionists/:id`
- `POST /api/nutritionists`
- `DELETE /api/nutritionists/:id`
- `DELETE /api/nutritionists`
- `DELETE /api/subscriptions`
- `PUT /api/lists/:key`

Admin routes require the token returned by `/api/admin/login` in `x-admin-token` or `Authorization: Bearer <token>`.
