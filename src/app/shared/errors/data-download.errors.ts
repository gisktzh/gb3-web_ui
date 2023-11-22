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

export class CurrentMunicipalityCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die detaillierten Gemeindeinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'CurrentMunicipalityCouldNotBeLoaded';
}
