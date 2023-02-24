import {TestBed} from '@angular/core/testing';
import {LocalStorageService} from './local-storage.service';

let store: Record<string, string> = {};

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);

    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => {
      return store[key] || null;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => {
      return (store[key] = <string>value);
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  describe('get', () => {
    it('returns an existing item', () => {
      const expected = 'expected-value';
      store['onboardingGuideViewed'] = expected;

      const result = service.get('onboardingGuideViewed');

      expect(result).toEqual(expected);
    });

    it('returns an null for key that does not exist', () => {
      const result = service.get('onboardingGuideViewed');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('sets a value for a given key', () => {
      const expected = 'new-value';

      service.set('onboardingGuideViewed', expected);

      expect(service.get('onboardingGuideViewed')).toEqual('new-value');
    });
  });

  describe('exists', () => {
    it('returns true if a key exists', () => {
      store['onboardingGuideViewed'] = 'xxx';

      const result = service.exists('onboardingGuideViewed');

      expect(result).toBeTrue();
    });
    it('returns false if a key does not exist', () => {
      const result = service.exists('onboardingGuideViewed');

      expect(result).toBeFalse();
    });
  });
});
