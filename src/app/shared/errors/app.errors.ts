import {FatalError, SilentError} from './abstract.errors';

export class PageNotificationsCouldNotBeLoaded extends SilentError {
  public override message = 'PageNotifications konnten nicht geladen werden.';
}

export class HostNameResolutionMismatch extends FatalError {
  public override message = 'Es konnte kein passender Hostname aufgelöst werden.';
}
