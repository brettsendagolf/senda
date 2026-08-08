/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host:true exposes the dev server on the local network so a phone on the
  // same wifi can reach it at http://<your-mac-ip>:5173
  server: { host: true },
  resolve: {
    // `@/...` maps to `src/...` so imports stay stable as folders move around.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Generator tests are pure logic — no DOM needed, so the fast node env.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
