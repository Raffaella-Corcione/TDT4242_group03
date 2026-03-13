import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['./tests/**/*.{test,spec}.{ts,tsx}'],
    // Helpful if you import CSS in React components (you do: DeclarationFormPage.css)
    css: true,

	coverage: {
      provider: 'v8', // use Node's built-in coverage (no extra dependency required)
      reporter: ['text', 'lcov', 'html'], // terminal summary, lcov file, and HTML report
      reportsDirectory: './coverage',
      all: true, // collect coverage from files even if not imported by tests
      include: ['client/src/**/*.{ts,tsx}'], // files to include in coverage
      exclude: ['**/*.d.ts', 'client/src/main.*', 'client/src/vite-env.*'],
      // Thresholds - tests will fail if coverage is below these percentages
      // Adjust numbers to suit your project policy
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60
    }
  }
});
