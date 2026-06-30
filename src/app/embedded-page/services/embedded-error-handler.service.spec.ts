import {TestBed} from '@angular/core/testing';
import {SilentError} from '../../shared/errors/abstract.errors';
import {environment} from '../../../environments/environment';
import {EmbeddedErrorHandlerService} from './embedded-error-handler.service';

class TestSilentError extends SilentError {}

describe('EmbeddedErrorHandlerService', () => {
  let service: EmbeddedErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbeddedErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logging', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(vi.fn());
      vi.spyOn(console, 'error').mockImplementation(vi.fn());
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
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(testError);
    });

    it('logs a Gb3RuntimeError to the console if it has no wrapped error', () => {
      environment.production = false;
      const testError = new TestSilentError();

      service.handleError(testError);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(testError);
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
