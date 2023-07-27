import {FatalError, SilentError} from './abstract.errors';

export class PageNotificationsCouldNotBeLoaded extends SilentError {
  public override message = 'PageNotifications could not be loaded.';
}

export class HostNameResolutionMismatch extends FatalError {
  public override message = 'Cannot find a matching hostname for URL resolution.';
}
