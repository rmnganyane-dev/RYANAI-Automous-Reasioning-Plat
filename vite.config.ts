import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures relative asset loading in production containers
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      ignored: ['**/src-tauri/target/**'],
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});