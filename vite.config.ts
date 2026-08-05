/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
