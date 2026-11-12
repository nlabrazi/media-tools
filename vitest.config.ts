import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.nuxt/**', '.output/**'],
  },
})
