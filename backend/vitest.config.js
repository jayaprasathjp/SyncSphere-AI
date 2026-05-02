import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.js'],
      exclude: ['node_modules', '__tests__', 'vitest.config.js'],
    },
  },
});
