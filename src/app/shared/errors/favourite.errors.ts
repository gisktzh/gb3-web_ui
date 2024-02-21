import {RecoverableError} from './abstract.errors';

export class FavouriteCouldNotBeCreated extends RecoverableError {
  public override message = 'Der Favorit konnte nicht gespeichert werden.';
  public override name = 'FavouriteCouldNotBeCreated';
}

export class FavouriteCouldNotBeRemoved extends RecoverableError {
  public override message = 'Der Favorit konnte nicht gelöscht werden.';
  public override name = 'FavouriteCouldNotBeRemoved';
}

export class FavouriteIsInvalid extends RecoverableError {
  public override name = 'FavouriteIsInvalid';

  constructor(reason: string) {
    super();
    this.message = `Ungültiger Favorit: ${reason}`;
  }
}

export class FavouritesCouldNotBeLoaded extends RecoverableError {
  public override message = 'Favoriten konnten nicht geladen werden.';
  public override name = 'FavouritesCouldNotBeLoaded';
}

export class FavouriteCouldNotBeLoaded extends RecoverableError {
  public override name = 'FavouriteCouldNotBeLoaded';

  constructor(originalError?: unknown) {
    super(originalError);
    if (originalError instanceof RecoverableError && originalError.message) {
      this.message = originalError.message;
    } else {
      this.message = 'Der Favorit konnte nicht geladen werden.';
    }
  }
}
