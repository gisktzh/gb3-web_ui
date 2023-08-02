import {ErrorHandler, Injectable, NgZone} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PanelClass} from '../shared/enums/panel-class.enum';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {ErrorNotificationComponent} from './components/error-notification/error-notification.component';
import {ErrorNotificationInterface} from './interfaces/error-notification.interface';
import {Gb3RuntimeError, RecoverableError, SilentError} from '../shared/errors/abstract.errors';
import {MainPage} from '../shared/enums/main-page.enum';

const NOTIFICATION_DURATION_IN_MS = 10_000;

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(
    private snackBar: MatSnackBar,
    private readonly router: Router,
    private zone: NgZone,
  ) {}

  public async handleError(error: any): Promise<void> {
    // log errors to console for easier debugging in non-productive environments
    if (!environment.production) {
      console.error(error);

      if (error instanceof Gb3RuntimeError && error.originalError) {
        console.error('Original error was:', error.originalError);
      }
    }

    if (error instanceof SilentError) {
      // these errors should only be logged to a frontend logging service, but not displayed.
    } else if (error instanceof RecoverableError) {
      this.showRecoverableErrorMessage(error.message);
    } else {
      // sometimes, the error handler is not yet tied to the Angular zone, so we make sure it is run *within* the angular zone.
      this.zone.run(() => {
        this.router.navigate([MainPage.Error], {queryParams: {error: error.message}, skipLocationChange: true});
      });
    }
  }

  /**
   * Triggers the snackbar notification for recoverable errors. Because we're doing this from within the ErrorHandler, we need to force
   * this to be run in the Angular zone, otherwise, we get weird behaviours sometimes.
   *
   * See: https://github.com/angular/components/issues/9875
   */
  private showRecoverableErrorMessage(message: string) {
    this.zone.run(() => {
      this.snackBar.openFromComponent<ErrorNotificationComponent, ErrorNotificationInterface>(ErrorNotificationComponent, {
        data: {error: message, duration: NOTIFICATION_DURATION_IN_MS},
        panelClass: PanelClass.ErrorSnackbar,
        duration: NOTIFICATION_DURATION_IN_MS,
      });
    });
  }
}
