import {TestBed} from '@angular/core/testing';
import {LocalStorageService} from './local-storage.service';

let store: Record<string, string> = {};

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);

    store = {};

    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string): string | null => {
      return store[key] || null;
    });
    vi.spyOn(localStorage, 'removeItem').mockImplementation((key: string): void => {
      delete store[key];
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    vi.spyOn(localStorage, 'clear').mockImplementation(() => {
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
