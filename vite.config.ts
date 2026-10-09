import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (command === 'build' && env.VERCEL === '1') {
    const apiBaseUrl =
      env.VITE_API_BASE_URL?.trim() || env.VITE_API_URL?.trim();
    let apiUrl: URL | undefined;
    try {
      apiUrl = apiBaseUrl ? new URL(apiBaseUrl) : undefined;
    } catch {
      // Report a deployment-specific configuration error below.
    }
    if (
      !apiUrl ||
      apiUrl.protocol !== 'https:' ||
      apiUrl.pathname !== '/' ||
      apiUrl.search ||
      apiUrl.hash ||
      apiUrl.username ||
      apiUrl.password ||
      [env.VERCEL_URL, env.VERCEL_PROJECT_PRODUCTION_URL].includes(apiUrl.host)
    ) {
      throw new Error(
        'Set VITE_API_BASE_URL to the HTTPS origin of the separately hosted Fastify API (without /api or a route path), then rebuild. Vercel only hosts the frontend; same-origin /api requests return 404 NOT_FOUND.',
      );
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.VITE_PORT || 1420),
      strictPort: true,
      watch: {
        usePolling: true, // Prevents file-watching issues inside Codespaces/Docker
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: process.env.VITE_API_URL || 'ws://localhost:3001',
          changeOrigin: true,
          ws: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV !== 'production',
    },
  };
});
