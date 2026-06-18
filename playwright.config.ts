import {defineConfig, devices} from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: 'html',
  globalTeardown: require.resolve('./e2e/global.teardown'),
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',

    // DEBUGGING: The following options are left here for convenience. They're super useful for debugging.
    // headless: false,
    launchOptions: {
      slowMo: 50,
      firefoxUserPrefs: process.env['CI']
        ? {
            'webgl.disabled': false,
            'webgl.force-enabled': true,
            'webgl.enable-webgl2': true,
            'layers.acceleration.force-enabled': true,
          }
        : {},
    },
  },
  testMatch: 'e2e/specs/*.spec.ts',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1080},
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: {width: 1920, height: 1080},
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: {width: 1920, height: 1080},
      },
    },
  ],
});
