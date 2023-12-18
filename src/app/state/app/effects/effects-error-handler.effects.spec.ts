import {Observable, of, throwError} from 'rxjs';
import {fakeAsync, tick} from '@angular/core/testing';
import {effectErrorHandler} from './effects-error-handler.effects';
import {ErrorHandler} from '@angular/core';
import {Action} from '@ngrx/store';

describe('EffectsErrorHandler', () => {
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);
  });

  describe('effectErrorHandler', () => {
    it('catches an error and passes it to the global error handler', fakeAsync(() => {
      const testError = new Error('Test error');
      const observable$ = throwError(() => testError);
      const result$ = effectErrorHandler(observable$, errorHandlerMock);

      result$.subscribe({
        error: () => {
          fail('Error callback should not be called.');
        },
      });
      tick();
      expect(errorHandlerMock.handleError).toHaveBeenCalledWith(testError);
    }));

    it('does not call the error handler if the observable is running without error', (done: DoneFn) => {
      const expectedAction: Action = {type: 'mockAction'};
      const observable$: Observable<Action> = of(expectedAction);
      const result$ = effectErrorHandler(observable$, errorHandlerMock);

      result$.subscribe({
        next: (action) => {
          expect(action).toEqual(expectedAction);
          expect(errorHandlerMock.handleError).not.toHaveBeenCalled();
          done();
        },
        error: () => {
          fail('Error callback should not be called for a successful observable');
        },
      });
    });
  });
});
