import {RecoverableError} from './abstract.errors';

export class ShareLinkCouldNotBeLoaded extends RecoverableError {
  public override message = 'Der Inhalt des geteilten Links konnten nicht geladen werden.';
  public override name = 'ShareLinkCouldNotBeLoaded';
}

export class ShareLinkItemCouldNotBeCreated extends RecoverableError {
  public override message = 'Der Link konnte nicht erstellt werden.';
  public override name = 'ShareLinkItemCouldNotBeCreated';
}

export class ShareLinkPropertyCouldNotBeValidated extends RecoverableError {
  public override name = 'ShareLinkPropertyCouldNotBeValidated';

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class ShareLinkCouldNotBeValidated extends RecoverableError {
  public override message = 'Beim Laden Inhalt des geteilten Links ist etwas schief gelaufen.';
  public override name = 'ShareLinkCouldNotBeValidated';

  constructor(reason: string, isAuthenticated: boolean, originalError?: unknown) {
    super(originalError);
    let message = `Ungültiger Inhalt im geteilten Link: ${reason}`;
    if (!isAuthenticated) {
      message += '\nMöglicherweise hilft es, wenn Sie sich einloggen.';
    }
    this.message = message;
  }
}

export class ShareLinkParameterInvalid extends RecoverableError {
  public override message = 'Ungültiger Link zum Teilen.';
  public override name = 'ShareLinkParameterInvalid';
}
