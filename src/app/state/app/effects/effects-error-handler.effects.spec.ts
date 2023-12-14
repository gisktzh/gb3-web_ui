import {Observable, of, throwError} from 'rxjs';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {effectErrorHandler} from './effects-error-handler.effects';
import {ErrorHandler} from '@angular/core';

describe('EffectsErrorHandler', () => {
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        provideMockStore(),
        {
          provide: ErrorHandler,
          useValue: errorHandlerMock,
        },
      ],
    });
  });

  describe('effectErrorHandler', () => {
    it('should handle error and pass it to the global error handler', fakeAsync(() => {
      // Arrange
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

    it('should not handle error for a successful observable', (done: DoneFn) => {
      const observable$: Observable<any> = of('success');

      const result$ = effectErrorHandler(observable$, errorHandlerMock);

      result$.subscribe({
        next: (value) => {
          expect(value).toEqual('success');
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
