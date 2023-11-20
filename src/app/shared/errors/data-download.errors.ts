import {RecoverableError} from './abstract.errors';

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
  public override message = 'Beim Erstellen einer Bestellung ist etwas schief gelaufen.';
  public override name = 'OrderCouldNotBeSent';
}

export class OrderStatusCouldNotBeSent extends RecoverableError {
  public override message = 'Beim Aktualisieren einer Bestellung ist ein Fehler aufgetreten.';
  public override name = 'OrderCouldNotBeProcessed';
}

export class OrderUnsupportedGeometry extends RecoverableError {
  public override message = 'Die Bestellung konnte wegen ungültiger Geometrie nicht erstellt werden.';
  public override name = 'OrderUnsupportedGeometry';
}

export class OrderSelectionIsInvalid extends RecoverableError {
  public override message = 'Die Bestellung konnte nicht erstellt werden.';
  public override name = 'OrderSelectionIsInvalid';
}
