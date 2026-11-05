import type {Page} from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T = unknown> {
      toHaveNoAccessibilityViolations(): R;
    }
  }
}

export {};
