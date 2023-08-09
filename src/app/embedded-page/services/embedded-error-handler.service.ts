import {ErrorHandler, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Gb3RuntimeError} from '../../shared/errors/abstract.errors';

@Injectable({
  providedIn: 'root',
})
export class EmbeddedErrorHandlerService implements ErrorHandler {
  public async handleError(error: any): Promise<void> {
    // log errors to console for easier debugging in non-productive environments
    if (!environment.production) {
      console.error(error);

      if (error instanceof Gb3RuntimeError && error.originalError) {
        console.error('Original error was:', error.originalError);
      }
    }
  }
}
