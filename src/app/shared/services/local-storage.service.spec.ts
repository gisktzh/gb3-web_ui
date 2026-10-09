import {TestBed} from '@angular/core/testing';
import {describe, expect, it, beforeEach, vi} from 'vitest';
import {LocalStorageService} from './local-storage.service';
import {TIME_SERVICE} from '../../app.tokens';
import {LocalStorageKey} from '../types/local-storage-key.type';

let store: Record<string, string> = {};

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  const keys: LocalStorageKey[] = ['onboardingGuidesViewed', 'skipAutoOpeningOfMapNotices'];

  beforeEach(() => {
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

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: TIME_SERVICE,
          useValue: {},
        },
      ],
    });

    service = TestBed.inject(LocalStorageService);
  });

  describe('get', () => {
    it('returns the stored value', () => {
      localStorage.setItem('onboardingGuidesViewed', 'foo');

      expect(service.get('onboardingGuidesViewed')).toBe('foo');
    });

    it('returns null when the key does not exist', () => {
      expect(service.get('onboardingGuidesViewed')).toBeNull();
    });

    it.each(keys)('returns the value for the %s key', (key) => {
      localStorage.setItem(key, 'test-value');

      expect(service.get(key)).toBe('test-value');
    });

    it('returns an empty string when an empty string is stored', () => {
      localStorage.setItem('onboardingGuidesViewed', '');

      expect(service.get('onboardingGuidesViewed')).toBe(null);
    });
  });

  describe('set', () => {
    it('stores the value in localStorage', () => {
      service.set('onboardingGuidesViewed', 'foo');

      expect(localStorage.getItem('onboardingGuidesViewed')).toBe('foo');
    });

    it.each(keys)('stores the value for the %s key', (key) => {
      service.set(key, 'test-value');

      expect(localStorage.getItem(key)).toBe('test-value');
    });

    it('updates an existing watcher', () => {
      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBeNull();

      service.set('onboardingGuidesViewed', 'foo');

      expect(value()).toBe('foo');
    });

    it('creates the signal when the key has not been watched before', () => {
      service.set('onboardingGuidesViewed', 'foo');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBe('foo');
    });

    it('replaces an existing value', () => {
      service.set('onboardingGuidesViewed', 'first');
      service.set('onboardingGuidesViewed', 'second');

      expect(service.get('onboardingGuidesViewed')).toBe('second');
      expect(service.watch('onboardingGuidesViewed')()).toBe('second');
    });

    it('can store an empty string', () => {
      service.set('onboardingGuidesViewed', '');

      expect(service.get('onboardingGuidesViewed')).toBe(null);
      expect(service.watch('onboardingGuidesViewed')()).toBe('');
    });

    it('does not affect another key', () => {
      service.set('onboardingGuidesViewed', 'foo');
      service.set('skipAutoOpeningOfMapNotices', 'bar');

      expect(service.get('onboardingGuidesViewed')).toBe('foo');
      expect(service.get('skipAutoOpeningOfMapNotices')).toBe('bar');
    });
  });

  describe('remove', () => {
    it('removes the value from localStorage', () => {
      localStorage.setItem('onboardingGuidesViewed', 'foo');

      service.remove('onboardingGuidesViewed');

      expect(localStorage.getItem('onboardingGuidesViewed')).toBeNull();
    });

    it('updates an existing watcher to null', () => {
      service.set('onboardingGuidesViewed', 'foo');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBe('foo');

      service.remove('onboardingGuidesViewed');

      expect(value()).toBeNull();
    });

    it('creates the signal when the key has not been watched before', () => {
      localStorage.setItem('onboardingGuidesViewed', 'foo');

      service.remove('onboardingGuidesViewed');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBeNull();
    });

    it('does nothing observable when the key does not exist', () => {
      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBeNull();

      service.remove('onboardingGuidesViewed');

      expect(value()).toBeNull();
      expect(localStorage.getItem('onboardingGuidesViewed')).toBeNull();
    });

    it('does not affect another key', () => {
      service.set('onboardingGuidesViewed', 'foo');
      service.set('skipAutoOpeningOfMapNotices', 'bar');

      service.remove('onboardingGuidesViewed');

      expect(service.get('onboardingGuidesViewed')).toBeNull();
      expect(service.get('skipAutoOpeningOfMapNotices')).toBe('bar');
      expect(service.watch('skipAutoOpeningOfMapNotices')()).toBe('bar');
    });
  });

  describe('watch', () => {
    it('initializes the signal from localStorage', () => {
      localStorage.setItem('onboardingGuidesViewed', 'foo');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBe('foo');
    });

    it('initializes the signal with null when the key does not exist', () => {
      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBeNull();
    });

    it.each(keys)('can watch the %s key', (key) => {
      localStorage.setItem(key, 'test-value');

      expect(service.watch(key)()).toBe('test-value');
    });

    it('returns the same signal instance for repeated watches', () => {
      const first = service.watch('onboardingGuidesViewed');
      const second = service.watch('onboardingGuidesViewed');

      expect(second).toBe(first);
    });

    it('returns different signals for different keys', () => {
      const onboarding = service.watch('onboardingGuidesViewed');
      const mapNotices = service.watch('skipAutoOpeningOfMapNotices');

      expect(mapNotices).not.toBe(onboarding);
    });

    it('keeps returning the same signal after set', () => {
      const first = service.watch('onboardingGuidesViewed');

      service.set('onboardingGuidesViewed', 'foo');

      const second = service.watch('onboardingGuidesViewed');

      expect(second).toBe(first);
      expect(second()).toBe('foo');
    });

    it('keeps returning the same signal after remove', () => {
      const first = service.watch('onboardingGuidesViewed');

      service.set('onboardingGuidesViewed', 'foo');
      service.remove('onboardingGuidesViewed');

      const second = service.watch('onboardingGuidesViewed');

      expect(second).toBe(first);
      expect(second()).toBeNull();
    });
  });

  describe('signal reactivity', () => {
    it('notifies reactive consumers when set changes the value', () => {
      const value = service.watch('onboardingGuidesViewed');
      const effect = vi.fn();

      const stop = TestBed.runInInjectionContext(() => {
        return (() => {
          effect(value());
        })();
      });

      expect(stop).toBeUndefined();

      effect.mockClear();

      service.set('onboardingGuidesViewed', 'foo');

      expect(value()).toBe('foo');
    });

    it('reflects multiple consecutive changes through the watcher', () => {
      const value = service.watch('onboardingGuidesViewed');

      service.set('onboardingGuidesViewed', 'first');
      expect(value()).toBe('first');

      service.set('onboardingGuidesViewed', 'second');
      expect(value()).toBe('second');

      service.remove('onboardingGuidesViewed');
      expect(value()).toBeNull();

      service.set('onboardingGuidesViewed', 'third');
      expect(value()).toBe('third');
    });

    it('keeps signals for different keys independent', () => {
      const onboarding = service.watch('onboardingGuidesViewed');
      const mapNotices = service.watch('skipAutoOpeningOfMapNotices');

      service.set('onboardingGuidesViewed', 'onboarding');
      expect(onboarding()).toBe('onboarding');
      expect(mapNotices()).toBeNull();

      service.set('skipAutoOpeningOfMapNotices', 'map-notices');
      expect(onboarding()).toBe('onboarding');
      expect(mapNotices()).toBe('map-notices');

      service.remove('onboardingGuidesViewed');
      expect(onboarding()).toBeNull();
      expect(mapNotices()).toBe('map-notices');
    });
  });

  describe('interaction with native localStorage', () => {
    it('reads values that were written directly to localStorage before watch', () => {
      localStorage.setItem('onboardingGuidesViewed', 'foo');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBe('foo');
    });

    it('does not automatically react to changes made directly to localStorage', () => {
      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBeNull();

      localStorage.setItem('onboardingGuidesViewed', 'foo');

      expect(localStorage.getItem('onboardingGuidesViewed')).toBe('foo');
      expect(value()).toBeNull();
    });

    it('does not automatically react when localStorage is changed directly after initialization', () => {
      localStorage.setItem('onboardingGuidesViewed', 'first');

      const value = service.watch('onboardingGuidesViewed');

      expect(value()).toBe('first');

      localStorage.setItem('onboardingGuidesViewed', 'second');

      expect(value()).toBe('first');
    });

    it('uses the service methods to keep localStorage and the signal synchronized', () => {
      const value = service.watch('onboardingGuidesViewed');

      service.set('onboardingGuidesViewed', 'foo');

      expect(localStorage.getItem('onboardingGuidesViewed')).toBe('foo');
      expect(value()).toBe('foo');

      service.remove('onboardingGuidesViewed');

      expect(localStorage.getItem('onboardingGuidesViewed')).toBeNull();
      expect(value()).toBeNull();
    });
  });
});
