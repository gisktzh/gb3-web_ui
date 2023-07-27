import {FatalError, RecoverableError} from '../../error-handling/models/errors';

export class TopicsCouldNotBeLoaded extends FatalError {
  public override message = 'Topics konnten nicht geladen werden.';
}

export class MapCouldNotBeFound extends FatalError {
  public override message = 'Map wurde nicht gefunden.';
}

export class NavigatorNotAvailable extends RecoverableError {
  public override message = 'Der Browser unterstützt keine Lokalisierung.';
}

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
