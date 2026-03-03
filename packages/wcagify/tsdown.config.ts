import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/pdf/index.ts'],
  format: 'esm',
  dts: true,
  outDir: 'dist',
  clean: true,
  hash: false
})
