import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      // Dev-only same-origin shim for /api. The browser only ever talks to
      // localhost this way, so the session cookie is never cross-site and CORS
      // never applies — which is exactly what an httpOnly cookie session needs.
      // Only active when VITE_API_URL is empty; with an absolute VITE_API_URL the
      // app talks to the backend cross-origin instead and this is bypassed.
      proxy: {
        '/api': {
          // process.env wins over the .env file, so one-off overrides work.
          target: process.env.VITE_API_PROXY_TARGET || env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

