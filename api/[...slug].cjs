// Vercel entrypoint. The API implementation lives in server/app.cjs so local
// Express and serverless deployments use the same routes and database code.

const { createApp } = require('../server/app.cjs');

let appPromise;

function withApiPrefix(req) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
}

module.exports = async function handler(req, res) {
  try {
    if (!appPromise) appPromise = createApp();
    const { app } = await appPromise;
    withApiPrefix(req);
    return app(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
};
