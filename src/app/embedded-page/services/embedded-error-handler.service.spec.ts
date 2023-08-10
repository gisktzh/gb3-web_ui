import {TestBed} from '@angular/core/testing';
import {FatalError, RecoverableError, SilentError} from '../../shared/errors/abstract.errors';
import {environment} from '../../../environments/environment';
import {EmbeddedErrorHandlerService} from './embedded-error-handler.service';

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

describe('EmbeddedErrorHandlerService', () => {
  let service: EmbeddedErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbeddedErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('error handling', () => {
    it('handles SilentErrors silently', () => {
      const testError = new TestSilentError();
      service.handleError(testError);
    });

    it('handles RecoverableErrors silently', () => {
      const testErrorMessage = 'error message';
      const testError = new TestRecoverableError(testErrorMessage);
      service.handleError(testError);
    });

    it('handles FatalErrors silently', () => {
      const testErrorMessage = 'error message';
      const testError = new TestFatalError(testErrorMessage);
      service.handleError(testError);
    });

    it('handles non Gb3RuntimeErrors silently', () => {
      const testErrorMessage = 'error message';
      const testError = new Error(testErrorMessage);
      service.handleError(testError);
    });
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
