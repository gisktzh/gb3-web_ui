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
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  describe('get', () => {
    it('returns an existing item', () => {
      const expected = 'expected-value';
      store['onboardingGuidesViewed'] = expected;

      const result = service.get('onboardingGuidesViewed');

      expect(result).toEqual(expected);
    });

    it('returns an null for key that does not exist', () => {
      const result = service.get('onboardingGuidesViewed');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('sets a value for a given key', () => {
      const expected = 'new-value';

      service.set('onboardingGuidesViewed', expected);

      expect(service.get('onboardingGuidesViewed')).toEqual('new-value');
    });
  });
});
