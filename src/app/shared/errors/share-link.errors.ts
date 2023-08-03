import {RecoverableError} from './abstract.errors';

export class ShareLinkCouldNotBeLoaded extends RecoverableError {
  public override message = 'Der Inhalt des geteilten Links konnten nicht geladen werden.';
  public override name = 'ShareLinkCouldNotBeLoaded';
}

export class ShareLinkItemCouldNotBeCreated extends RecoverableError {
  public override message = 'Der Link konnte nicht erstellt werden.';
  public override name = 'ShareLinkItemCouldNotBeCreated';
}

export class ShareLinkCouldNotBeValidated extends RecoverableError {
  public override message = 'Beim Laden Inhalt des geteilten Links ist etwas schief gelaufen.';
  public override name = 'ShareLinkCouldNotBeValidated';

  constructor(reason: string) {
    super();
    this.message = `Ungültiger Inhalt im geteilten Link: ${reason}`;
    // TODO WES: add message about login if not logged in
  }
}

export class ShareLinkParameterInvalid extends RecoverableError {
  public override message = 'Ungültiger Link zum Teilen.';
  public override name = 'ShareLinkParameterInvalid';
}
