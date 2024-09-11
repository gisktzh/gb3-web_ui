import {Gb3RuntimeError, RecoverableError} from './abstract.errors';

export class InitialMapsParameterInvalid extends RecoverableError {
  public override name = 'InitialMapsParameterInvalid';

  constructor(initialMapParameter: string) {
    super();
    this.message = `Die Karte "${initialMapParameter}" konnte nicht geladen werden.`;
  }
}
export class InitialMapsCouldNotBeLoaded extends RecoverableError {
  public override name = 'InitialMapsCouldNotBeLoaded';

  constructor(isAuthenticated: boolean, originalError?: unknown) {
    super(originalError);
    let reason = 'Unbekannter Fehler';
    if (originalError && originalError instanceof Gb3RuntimeError && originalError.message) {
      reason = originalError.message;
    }

    let message = `Ungültige URL Paramter: ${reason}`;
    if (!isAuthenticated) {
      message += '\nMöglicherweise hilft es, wenn Sie sich einloggen.';
    }
    this.message = message;
  }
}
