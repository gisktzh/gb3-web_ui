import {RecoverableError, SilentError} from './abstract.errors';

export class ProductsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Produktinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'ProductsCouldNotBeLoaded';
}

export class RelevantProductsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die relevanten Produktinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'RelevantProductsCouldNotBeLoaded';
}

export class CantonCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die relevanten Kantonsinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'CantonCouldNotBeLoaded';
}

export class MunicipalitiesCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die relevanten Gemeindeinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'MunicipalitiesCouldNotBeLoaded';
}

export class OrderCouldNotBeSent extends RecoverableError {
  public override name = 'OrderCouldNotBeSent';

  constructor(originalError?: unknown, reason?: string) {
    super(originalError);
    let message = 'Beim Erstellen einer Bestellung ist etwas schief gelaufen.';
    if (reason) {
      message += `\nDetails: '${reason}'`;
    }
    this.message = message;
  }
}

export class OrderStatusCouldNotBeSent extends SilentError {
  public override message = 'Beim Aktualisieren einer Bestellung ist ein Fehler aufgetreten.';
  public override name = 'OrderCouldNotBeProcessed';
}

export class OrderStatusWasAborted extends RecoverableError {
  public override message = 'Beim Aktualisieren einer Bestellung sind mehrere Fehler aufgetreten und der Prozess wurde abgebrochen.';
  public override name = 'OrderStatusWasAborted';
}

export class OrderUnsupportedGeometry extends RecoverableError {
  public override message = 'Die Bestellung konnte wegen ungültiger Geometrie nicht erstellt werden.';
  public override name = 'OrderUnsupportedGeometry';
}

export class OrderSelectionIsInvalid extends RecoverableError {
  public override message = 'Die Bestellung konnte nicht erstellt werden.';
  public override name = 'OrderSelectionIsInvalid';
}
