/**
 * A recoverable error only triggers a notification, but does not prevent the app from being used further.
 */
export abstract class RecoverableError extends Error {}

/**
 * A fatal error  prevents the app from being used further and displays an error page.
 */
export abstract class FatalError extends Error {}

/**
 * A silent error is logged in dev mode, but does not trigger any visual indication to the user.
 */
export abstract class SilentError extends Error {}
