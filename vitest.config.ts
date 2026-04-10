import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    silent: true, // Surpresses unnecessary stderr output from tests.
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    isolate: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    reporters: ['default'],
    server: {
      deps: {
        inline: ['@arcgis/core', '@esri/calcite-components'],
      },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/gb3-frontend',
      reporter: ['html', 'text-summary', 'lcov'],
      exclude: [
        '**/main.ts',
        '**/configs/*.config.ts',
        '**/*.module.ts',
        '**/*.mock.ts',
        '**/*.stub.ts',
        '**/app/testing/**',
        '**/*.component.ts',
        '**/environments/environment*.ts',
      ],
    },
  },
});
