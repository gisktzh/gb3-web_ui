import {RecoverableError} from './abstract.errors';

export class FavouriteCouldNotBeCreated extends RecoverableError {
  public override message = 'Der Favorit konnte nicht gespeichert werden.';
}

export class FavouriteCouldNotBeRemoved extends RecoverableError {
  public override message = 'Der Favorit konnte nicht gelöscht werden.';
}

export class FavouriteIsInvalid extends RecoverableError {
  constructor(reason: string) {
    super();
    this.message = `Ungültiger Favorit: ${reason}`;
  }
}

export class FavouritesCouldNotBeLoaded extends RecoverableError {
  public override message = 'Favoriten konnten nicht geladen werden.';
}
