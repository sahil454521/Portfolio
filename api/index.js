// Vercel runs this as one serverless function for every /api/* request
// (see the rewrite in vercel.json). The app itself lives in server/app.js.
import app from '../server/app.js';

export default app;
