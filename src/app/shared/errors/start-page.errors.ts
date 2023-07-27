import {RecoverableError, SilentError} from './abstract.errors';

export class TwitterFeedCouldNotBeLoaded extends SilentError {
  public override message = 'TwitterFeed could not be loaded.';
}

export class NewsCouldNotBeLoaded extends RecoverableError {
  public override message = 'News konnten nicht geladen werden.';
}

export class FrequentlyUsedItemsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Häufig Verwendete Daten konnten nicht geladen werden.';
}

export class DiscoverMapsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Karten Entdecken konnte nicht geladen werden.';
}
