import {ErrorHandler, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Gb3RuntimeError} from '../../shared/errors/abstract.errors';

@Injectable({
  providedIn: 'root',
})
export class EmbeddedErrorHandlerService implements ErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- official handleError type from Angular
  public handleError(error: any) {
    // log errors to console for easier debugging in non-productive environments
    if (!environment.production) {
      console.error(error);

      if (error instanceof Gb3RuntimeError && error.originalError) {
        console.error('Original error was:', error.originalError);
      }
    }
  }
}
