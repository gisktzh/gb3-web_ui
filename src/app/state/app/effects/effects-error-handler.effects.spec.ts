import type {MockedObject} from 'vitest';
import {Observable, of, throwError} from 'rxjs';
import {effectErrorHandler} from './effects-error-handler.effects';
import {ErrorHandler} from '@angular/core';
import {Action} from '@ngrx/store';

describe('EffectsErrorHandler', () => {
  let errorHandlerMock: MockedObject<ErrorHandler>;

  beforeEach(() => {
    errorHandlerMock = {
      handleError: vi.fn(),
    };
  });

  describe('effectErrorHandler', () => {
    it('catches an error and passes it to the global error handler', async () => {
      vi.useFakeTimers();

      const testError = new Error('Test error');
      const observable$ = throwError(() => testError);
      const result$ = effectErrorHandler(observable$, errorHandlerMock);

      result$.subscribe({
        error: () => {
          throw new Error('Error callback should not be called.');
        },
      });
      await vi.runAllTimersAsync();
      expect(errorHandlerMock.handleError).toHaveBeenCalledWith(testError);

      vi.useRealTimers();
    });

    it('does not call the error handler if the observable is running without error', () => {
      const expectedAction: Action = {type: 'mockAction'};
      const observable$: Observable<Action> = of(expectedAction);
      const result$ = effectErrorHandler(observable$, errorHandlerMock);

      result$.subscribe({
        next: (action) => {
          expect(action).toEqual(expectedAction);
          expect(errorHandlerMock.handleError).not.toHaveBeenCalled();
        },
        error: () => {
          throw new Error('Error callback should not be called for a successful observable');
        },
      });
    });
  });
});
