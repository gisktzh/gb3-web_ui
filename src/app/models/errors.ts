import {FatalError, RecoverableError, SilentError} from '../error-handling/models/errors';

export class PageNotificationsCouldNotBeLoaded extends SilentError {
  public override message = 'PageNotifications could not be loaded.';
}

export class TwitterFeedCouldNotBeLoaded extends SilentError {
  public override message = 'TwitterFeed could not be loaded.';
}

export class HostNameResolutionMismatch extends FatalError {
  public override message = 'Cannot find a matching hostname for URL resolution.';
}

export class FavouritesCouldNotBeLoaded extends RecoverableError {
  public override message = 'Favoriten konnten nicht geladen werden.';
}

export class GeneralInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Allgemeine Infos konnten nicht geladen werden.';
}

export class FeatureInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Datensatzinfos konnten nicht geladen werden.';
}

export class LegendCouldNotBeLoaded extends RecoverableError {
  public override message = 'Legende konnte nicht geladen werden.';
}

export class PrintInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Druckoptionen konnten nicht geladen werden.';
}

export class PrintRequestCouldNotBeHandled extends RecoverableError {
  public override message = 'Beim Drucken ist etwas schief gelaufen.';
}
