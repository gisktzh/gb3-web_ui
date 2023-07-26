import {ErrorHandler, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PanelClass} from '../shared/enums/panel-class.enum';
import {RecoverableError} from './models/errors';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(
    private snackBar: MatSnackBar,
    private readonly router: Router,
  ) {}

  public async handleError(error: any): Promise<void> {
    // log errors to console for easier debugging in production
    if (!environment.production) {
      console.error(error);
    }

    if (error instanceof RecoverableError) {
      this.showRecoverableErrorMessage(error.message);
    } else {
      await this.router.navigate(['/error'], {queryParams: {error: error.message}, skipLocationChange: true});
    }
  }

  private showRecoverableErrorMessage(message: string) {
    this.snackBar.open(message, 'x', {panelClass: PanelClass.ErrorSnackbar});
  }
}
