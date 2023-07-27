import {RecoverableError} from '../../error-handling/models/errors';

export class NewsCouldNotBeLoaded extends RecoverableError {
  public override message = 'News konnten nicht geladen werden.';
}

export class FrequentlyUsedItemsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Häufig Verwendete Daten konnten nicht geladen werden.';
}

export class DiscoverMapsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Karten Entdecken konnte nicht geladen werden.';
}
