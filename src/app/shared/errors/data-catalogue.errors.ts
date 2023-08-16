import {RecoverableError} from './abstract.errors';

export class MetadataOverviewCouldNotBeLoaded extends RecoverableError {
  public override message = 'Metadatenübersicht konnte nicht geladen werden.';
  public override name = 'MetadataOverviewCouldNotBeLoaded';
}

export class MetadataCouldNotBeLoaded extends RecoverableError {
  public override message = 'Metadaten konnten nicht geladen werden.';
  public override name = 'MetadataCouldNotBeLoaded';
}

export class MetadataNotFound extends RecoverableError {
  public override message = 'Metadaten konnten nicht gefunden werden.';
  public override name = 'MetadataNotFound';
}
