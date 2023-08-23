import {RecoverableError} from './abstract.errors';

export class SearchResultsCouldNotBeLoaded extends RecoverableError {
  public override message = 'Die Resultate für die aktuelle Suche konnten nicht geladen werden.';
  public override name = 'SearchResultsCouldNotBeLoaded';
}
