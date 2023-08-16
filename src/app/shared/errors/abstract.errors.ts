export abstract class Gb3RuntimeError extends Error {
  public readonly originalError?: unknown;

  constructor(originalError?: unknown) {
    super();

    this.originalError = originalError;
  }
}

/**
 * A recoverable error only triggers a notification, but does not prevent the app from being used further.
 */
export abstract class RecoverableError extends Gb3RuntimeError {}

/**
 * A fatal error  prevents the app from being used further and displays an error page.
 */
export abstract class FatalError extends Gb3RuntimeError {}

/**
 * A silent error is logged in dev mode, but does not trigger any visual indication to the user.
 */
export abstract class SilentError extends Gb3RuntimeError {}
