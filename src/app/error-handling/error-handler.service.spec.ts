import {TestBed} from '@angular/core/testing';

import {ErrorHandlerService} from './error-handler.service';
import {FatalError, RecoverableError, SilentError} from '../shared/errors/abstract.errors';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PanelClass} from '../shared/enums/panel-class.enum';
import {Router} from '@angular/router';
import {MainPage} from '../shared/enums/main-page.enum';
import {environment} from '../../environments/environment';

class TestSilentError extends SilentError {}

class TestRecoverableError extends RecoverableError {
  constructor(message: string = '') {
    super();
    this.message = message;
  }
}

class TestFatalError extends FatalError {
  constructor(message: string = '') {
    super();
    this.message = message;
  }
}

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const snackBarSpyObj = jasmine.createSpyObj<MatSnackBar>(['openFromComponent']);
    const routerSpyObj = jasmine.createSpyObj<Router>(['navigate']);
    TestBed.configureTestingModule({
      providers: [
        {provide: MatSnackBar, useValue: snackBarSpyObj},
        {provide: Router, useValue: routerSpyObj},
      ],
    });
    service = TestBed.inject(ErrorHandlerService);
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('handles SilentErrors correctly', () => {
    const testError = new TestSilentError();

    service.handleError(testError);

    // nothing should happen, so we check for other behaviours to NOT have been called.
    expect(snackBarSpy.openFromComponent).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('handles RecoverableErrors correctly', () => {
    const testErrorMessage = 'error message';
    const testError = new TestRecoverableError(testErrorMessage);

    service.handleError(testError);

    expect(snackBarSpy.openFromComponent).toHaveBeenCalledOnceWith(jasmine.any(Function), {
      data: {
        error: testErrorMessage,
        duration: 10000,
      },
      panelClass: PanelClass.ErrorSnackbar,
      duration: 10000,
    });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('handles FatalErrors correctly', () => {
    const testErrorMessage = 'error message';
    const testError = new TestFatalError(testErrorMessage);

    service.handleError(testError);

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith([MainPage.Error], {
      queryParams: {error: testErrorMessage},
      skipLocationChange: true,
    });
    expect(snackBarSpy.openFromComponent).not.toHaveBeenCalled();
  });

  it('handles non Gb3RuntimeErrors correctly', () => {
    const testErrorMessage = 'error message';
    const testError = new Error(testErrorMessage);

    service.handleError(testError);

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith([MainPage.Error], {
      queryParams: {error: testErrorMessage},
      skipLocationChange: true,
    });
    expect(snackBarSpy.openFromComponent).not.toHaveBeenCalled();
  });

  describe('logging', () => {
    beforeEach(() => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
    });
    it('does not log if environment === production', () => {
      environment.production = true;
      const testError = new TestSilentError();

      service.handleError(testError);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('logs a non Gb3RuntimeError to the console', () => {
      environment.production = false;
      const testError = new Error();

      service.handleError(testError);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledOnceWith(testError);
    });

    it('logs a Gb3RuntimeError to the console if it has no wrapped error', () => {
      environment.production = false;
      const testError = new TestSilentError();

      service.handleError(testError);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledOnceWith(testError);
    });

    it('logs a Gb3RuntimeError to the console and also logs a wrapped error', () => {
      environment.production = false;
      const testWrappedError = new Error('Test Error in Wrap');
      const testError = new TestSilentError(testWrappedError);

      service.handleError(testError);

      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(testError);
      expect(console.error).toHaveBeenCalledWith('Original error was:', testWrappedError);
    });
  });
});
