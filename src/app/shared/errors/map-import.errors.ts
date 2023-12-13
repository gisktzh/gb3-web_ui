import {RecoverableError} from './abstract.errors';

export class ExternalServiceCouldNotBeLoaded extends RecoverableError {
  public override name = 'ExternalServiceCouldNotBeLoaded';

  constructor(originalError?: unknown) {
    super(originalError);
    if (originalError instanceof RecoverableError && originalError.message) {
      this.message = originalError.message;
    } else {
      this.message = 'Der angegebene Dienst konnte nicht geladen werden.';
    }
  }
}

export class ExternalServiceHasNoLayers extends RecoverableError {
  public override message = 'Der angegeben Dienst konnte nicht korrekt geladen werden.';
  public override name = 'ExternalServiceHasNoLayers';
}
