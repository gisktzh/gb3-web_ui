import {RecoverableError} from '../../error-handling/models/errors';

export class MetadataCouldNotBeLoaded extends RecoverableError {
  public override message = 'Metadaten konnten nicht geladen werden.';
}

export class MetadataNotFound extends RecoverableError {
  public override message = 'Metadaten konnten nicht gefunden werden.';
}
