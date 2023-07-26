abstract class Gb3RuntimeError extends Error {
  public abstract recoverable: boolean;
}

export abstract class RecoverableError extends Error {}

export abstract class FatalError extends Error {}
