<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# NutriMeet

This repository contains a React + TypeScript frontend and a small Express API backed by a SQLite database (using `sql.js` for portability).

## Quick start

1. Install dependencies

```bash
npm install
```

2. Initialize the database (creates `data/db.sqlite` with seeded sample data)

```bash
npm run init-db
```

3. Start the API server

```bash
npm run start:server
```

4. Start the frontend (Vite)

```bash
npm run dev
```

- Frontend runs on `http://localhost:3002/` (Vite may pick another free port).
- API runs on `http://localhost:4000` and is proxied by Vite under `/api/*`.

## Admin API endpoints

- `PUT /api/subscriptions/:id/status` - body `{ status: 'approved' | 'rejected' | 'pending' }`
- `PUT /api/nutritionists/:id` - update nutritionist fields (JSON body)
- `POST /api/nutritionists` - create new nutritionist (JSON body)
- `DELETE /api/nutritionists/:id` - delete nutritionist
- `PUT /api/lists/:key` - replace list (specialties, approaches, states) with `{ value: [...] }`

## Notes

- The API writes back to `data/db.sqlite` on every mutation. The server uses `sql.js` to avoid native dependency compilation.
- If you prefer a native SQLite driver, switch to `better-sqlite3` and install the required build tools (Visual Studio Build Tools + Windows SDK).

If you want, I can:
- Add tests for the API endpoints.
- Add more granular permission checks for admin routes.
- Create UI feedback (toasts) for save/delete actions in the admin panel.
