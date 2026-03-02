import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist',
    clean: true,
    hash: false
  },
  {
    entry: ['src/cli.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist',
    hash: false,
    outputOptions: {
      banner: '#!/usr/bin/env node\n'
    }
  }
])
