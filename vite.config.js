import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import api from './server/app.js';

// The Express app answers /api/* in development and in `vite preview`, so the
// whole stack runs as one process on one port. On Vercel the same app runs
// as a serverless function (api/index.js).
// (a braced body on purpose: a function returned from these hooks is treated
// by Vite as a hook to run later)
const mountApi = (server) => {
  server.middlewares.use((req, res, next) => (req.url.startsWith('/api/') ? api(req, res, next) : next()));
};

export default defineConfig({
  plugins: [
    react(),
    { name: 'api', configureServer: mountApi, configurePreviewServer: mountApi },
  ],
  build: {
    rollupOptions: {
      // two pages: the site (React) and the résumé (plain, printable HTML)
      input: { main: 'index.html', cv: 'cv.html' },
    },
  },
});
