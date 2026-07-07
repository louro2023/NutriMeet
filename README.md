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

Set at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require&channel_binding=require"
ADMIN_TOKEN_SECRET="use-a-long-random-secret"
```

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

The app no longer uses `data/db.sqlite` or `sql.js`. All persistent data lives in PostgreSQL/Neon.

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

Set these environment variables in Vercel:

- `DATABASE_URL`
- `ADMIN_TOKEN_SECRET`
- `GEMINI_API_KEY`, only if AI features are used
- `APP_URL`, if callbacks or absolute links need it

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
