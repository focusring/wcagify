import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname)
    }
  },
  test: {
    alias: {
      '~': resolve(__dirname)
    },
    include: ['test/unit/**/*.test.ts'],
    typecheck: {
      tsconfig: 'tsconfig.build.json'
    },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
