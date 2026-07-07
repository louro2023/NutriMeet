// Vercel entrypoint. The API implementation lives in server/app.cjs so local
// Express and serverless deployments use the same routes and database code.

const { createApp } = require('../server/app.cjs');

let appPromise;

function firstQueryValue(value) {
  if (Array.isArray(value)) return value.join('/');
  return value;
}

function normalizeApiUrl(req) {
  const parsed = new URL(req.url || '/', 'http://localhost');
  let pathname = parsed.pathname.replace(/\/+/g, '/');
  const rewritePath = firstQueryValue(req.query?.path) || parsed.searchParams.get('path');
  const rewriteSlug = firstQueryValue(req.query?.slug) || parsed.searchParams.get('slug');
  const rewritten = rewritePath || rewriteSlug;

  if (
    rewritten &&
    (
      pathname === '/' ||
      pathname === '/api/index.cjs' ||
      pathname === '/api/index' ||
      pathname === '/api/[...slug].cjs' ||
      pathname === '/api/[...slug]'
    )
  ) {
    pathname = `/api/${rewritten.replace(/^\/+/, '')}`;
    parsed.searchParams.delete('path');
    parsed.searchParams.delete('slug');
  }

  if (!pathname.startsWith('/api')) {
    pathname = `/api${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  }

  req.url = `${pathname}${parsed.search}`;
}

module.exports = async function handler(req, res) {
  try {
    if (!appPromise) appPromise = createApp();
    const { app } = await appPromise;
    normalizeApiUrl(req);
    return app(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
};
