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

2. Create a local `.env` file with admin credentials

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_TOKEN`.

3. Initialize the database (creates `data/db.sqlite` with seeded sample data)

```bash
npm run init-db
```

4. Start the API server

```bash
npm run start:server
```

5. Start the frontend (Vite)

```bash
npm run dev
```

---

## Deployment

### Vercel

- A aplicação funciona em Vercel com `vercel.json` e a função API em `api/[...slug].cjs`.
- `/api/*` é roteado para a função serverless, enquanto o frontend é servido como build estático.
- O login administrativo usa credenciais padrão embutidas quando não há variáveis de ambiente definidas.
- Importante: o SQLite local não é persistente em Vercel para escrita. A Vercel pode manter apenas leitura no deploy e qualquer gravação só funciona em tmpfs durante a execução.

### HostGator (futuro)

- No HostGator, recomendamos migrar para um banco de dados gerenciado ou um serviço externo antes de usar o app em produção.
- Caso o HostGator ofereça suporte a Node.js e escrita em disco, o SQLite pode ser usado com persistência na hospedagem.
- Se o HostGator não suportar Node.js diretamente, a melhor opção é adaptar o backend para um serviço compatível ou usar um banco externo como PostgreSQL, MySQL, Supabase, Neon ou PlanetScale.

### Admin credentials

- Existem credenciais internas padrão codificadas para acesso administrativo.
- Se quiser, pode configurar as variáveis de ambiente:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_TOKEN`

---

## Admin API endpoints

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
