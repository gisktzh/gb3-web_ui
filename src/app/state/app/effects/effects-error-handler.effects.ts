import {ErrorHandler} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Action} from '@ngrx/store';

export function effectErrorHandler<T extends Action>(observable$: Observable<T>, errorHandler: ErrorHandler): Observable<T> {
  return observable$.pipe(
    catchError((error, caught) => {
      errorHandler.handleError(error);
      return caught;
    }),
  );
}
