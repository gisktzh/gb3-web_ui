import {ErrorHandler} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Action} from '@ngrx/store';

export function effectErrorHandler<T extends Action>(observable$: Observable<T>, errorHandler: ErrorHandler): Observable<T> {
  return observable$.pipe(
    // 'caught' is necessary because catchError returns a new Observable
    catchError((e, caught) => {
      errorHandler.handleError(e);
      return caught;
    }),
  );
}
