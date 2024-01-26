import {TestBed} from '@angular/core/testing';
import {SessionStorageService} from './session-storage.service';

let store: Record<string, string> = {};

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);

    store = {};

    spyOn(sessionStorage, 'getItem').and.callFake((key: string): string | null => {
      return store[key] || null;
    });
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): string => {
      return (store[key] = <string>value);
    });
    spyOn(sessionStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  describe('get', () => {
    it('returns an existing item', () => {
      const expected = 'expected-value';
      store['shareLinkItem'] = expected;

      const result = service.get('shareLinkItem');

      expect(result).toEqual(expected);
    });

    it('returns null for key that does not exist', () => {
      const result = service.get('shareLinkItem');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('sets a value for a given key', () => {
      const expected = 'new-value';

      service.set('shareLinkItem', expected);

      expect(service.get('shareLinkItem')).toEqual('new-value');
    });

    it('overwrites a previously set value for a given key', () => {
      store['shareLinkItem'] = 'old-value';

      const expected = 'new-value';

      service.set('shareLinkItem', expected);

      expect(service.get('shareLinkItem')).toEqual('new-value');
    });
  });

  describe('remove', () => {
    it('removes an existing item', () => {
      store['shareLinkItem'] = 'old-value';

      service.remove('shareLinkItem');

      expect(store['shareLinkItem']).toBeUndefined();
    });

    it('ignores the removal of a non-existing key', () => {
      service.remove('shareLinkItem');

      expect(store['shareLinkItem']).toBeUndefined();
    });
  });
});
