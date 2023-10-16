import {RecoverableError} from './abstract.errors';

export class ProductsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Produktinformationen des Geodatenshops konnten nicht geladen werden.';
  public override name = 'ProductsCouldNotBeLoaded';
}
