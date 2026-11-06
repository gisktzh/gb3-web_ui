declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveNoAccessibilityViolations(): R;
    }
  }
}

export {};
