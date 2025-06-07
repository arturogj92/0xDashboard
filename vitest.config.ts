import { defineConfig } from 'vitest/config'
import path from 'path'


export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/next-env.d.ts'
      ]
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
})
