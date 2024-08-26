import {RecoverableError} from './abstract.errors';

export class SearchResultsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Resultate für die aktuelle Suche konnten nicht geladen werden.';
  public override name = 'SearchResultsCouldNotBeLoaded';
}

export class InvalidSearchParameters extends RecoverableError {
  public override message = 'Um über die URL zu suchen, müssen die Parameter "searchTerm" und "searchIndex" definiert sein.';
  public override name = 'InvalidSearchParameters';
}

export class NoSearchResultsFoundForParameters extends RecoverableError {
  constructor(searchTerm: string) {
    super();
    this.message = `Die URL-Suche für den Suchbegriff "${searchTerm}" hat keine Resultate geliefert.`;
  }
  public override name = 'NoSearchResultsFoundForParameters';
}
