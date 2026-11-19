import { defineSharedVitestConfig } from '@nlabrazi/config-vitest'

export default defineSharedVitestConfig({
  rootDir: import.meta.url,
  include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
  coverage: {
    thresholds: {
      lines: 80,
    },
  },
})
