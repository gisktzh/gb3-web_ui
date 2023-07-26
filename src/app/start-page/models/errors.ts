import {RecoverableError} from '../../error-handling/models/errors';

export class NewsCouldNotBeLoaded extends RecoverableError {
  public override message = 'News konnten nicht geladen werden.';
}
