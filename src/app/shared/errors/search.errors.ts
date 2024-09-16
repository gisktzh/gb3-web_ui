import {RecoverableError} from './abstract.errors';

export class SearchResultsCouldNotBeLoaded extends RecoverableError {
  public override name = 'SearchResultsCouldNotBeLoaded';

  constructor(isAuthenticated: boolean, originalError?: unknown) {
    super(originalError);

    let message = 'Die Resultate für die aktuelle Suche konnten nicht geladen werden.';
    if (!isAuthenticated) {
      message += '\nMöglicherweise hilft es, wenn Sie sich einloggen.';
    }
    this.message = message;
  }
}

export class InvalidSearchParameters extends RecoverableError {
  public override message =
    'Um über die URL zu suchen, müssen die Parameter "searchTerm" und "searchIndex" definiert sein. Bitte passen Sie die URL entsprechend an.';
  public override name = 'InvalidSearchParameters';
}

export class NoSearchResultsFoundForParameters extends RecoverableError {
  public override name = 'NoSearchResultsFoundForParameters';
  constructor(searchTerm: string) {
    super();
    this.message = `Die URL-Suche für den Suchbegriff "${searchTerm}" hat keine Resultate geliefert.`;
  }
}
