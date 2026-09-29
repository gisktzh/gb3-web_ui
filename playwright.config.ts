import {defineConfig, devices} from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  // ArcGIS uses WebGL heavily, rendered via Mesa's software rasterizer on CI (no real
  // GPU), so tests compete for CPU rather than a display/engine conflict. Each matrix
  // job already runs a single browser project, so we're trying 2 workers per job to
  // see whether that contention is small enough to still be a net speedup.
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI'] ? [['line'], ['html', {open: 'never'}]] : [['html', {open: 'never'}]],
  globalTeardown: require.resolve('./e2e/global.teardown'),
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // DEBUGGING: The following options are left here for convenience. They're super useful for debugging.
    // headless: false,
    launchOptions: {
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
        launchOptions: {
          args: ['--ozone-platform=wayland', '--enable-features=CDPScreenshotNewSurface'],
        },
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
