import {RecoverableError} from './abstract.errors';

export class NewsCouldNotBeLoaded extends RecoverableError {
  public override message = 'News konnten nicht geladen werden.';
  public override name = 'NewsCouldNotBeLoaded';
}

export class FrequentlyUsedItemsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Einträge der häufig verwendeten Daten konnten nicht geladen werden.';
  public override name = 'FrequentlyUsedItemsCouldNotBeLoaded';
}

export class DiscoverMapsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Einträge der Karten zum Entdecken konnte nicht geladen werden.';
  public override name = 'DiscoverMapsCouldNotBeLoaded';
}
