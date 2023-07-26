import {FatalError} from '../../error-handling/models/errors';

export class TopicsCouldNotBeLoaded extends FatalError {
  public override message = 'Topics konnten nicht geladen werden.';
}
