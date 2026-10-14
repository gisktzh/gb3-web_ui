import {signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {MapNoticesService} from './map-notices.service';
import {OnboardingGuideService} from 'src/app/onboarding-guide/services/onboarding-guide.service';
import {LocalStorageService} from 'src/app/shared/services/local-storage.service';
import {LocalStorageKey} from 'src/app/shared/types/local-storage-key.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectGb2WmsActiveMapItemsWithMapNotices} from 'src/app/state/map/selectors/active-map-items.selector';

describe('MapNoticesService', () => {
  type ActiveMapItem = ReturnType<typeof selectGb2WmsActiveMapItemsWithMapNotices>[number];

  let service: MapNoticesService;

  let activeMapItems: WritableSignal<ActiveMapItem[]>;
  let skipAutoOpening: WritableSignal<string | null>;

  let store: {
    selectSignal: ReturnType<typeof vi.fn>;
    dispatch: ReturnType<typeof vi.fn>;
  };

  let localStorageService: Mocked<LocalStorageService>;
  let onboardingGuideService: Mocked<OnboardingGuideService>;

  const createActiveMapItem = (isNoticeMarkedAsRead: boolean): ActiveMapItem => {
    return {
      settings: {
        isNoticeMarkedAsRead,
      },
    } as ActiveMapItem;
  };

  beforeEach(() => {
    activeMapItems = signal<ActiveMapItem[]>([]);
    skipAutoOpening = signal<string | null>(null);

    store = {
      selectSignal: vi.fn().mockReturnValue(activeMapItems),
      dispatch: vi.fn(),
    };

    localStorageService = {
      watch: vi.fn().mockReturnValue(skipAutoOpening),
      set: vi.fn(),
    } as unknown as Mocked<LocalStorageService>;

    onboardingGuideService = {
      isGuideShown: vi.fn().mockReturnValue(false),
    } as unknown as Mocked<OnboardingGuideService>;

    TestBed.configureTestingModule({
      providers: [
        MapNoticesService,
        {
          provide: Store,
          useValue: store,
        },
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
        {
          provide: OnboardingGuideService,
          useValue: onboardingGuideService,
        },
      ],
    });

    service = TestBed.inject(MapNoticesService);
  });

  describe('activeMapItemsWithNotices', () => {
    it('returns the active map items with notices from the store', () => {
      const items = [createActiveMapItem(false), createActiveMapItem(true)];

      activeMapItems.set(items);

      expect(service.activeMapItemsWithNotices()).toBe(items);
    });

    it('updates when the store signal changes', () => {
      const initialItems = [createActiveMapItem(false)];
      const updatedItems = [createActiveMapItem(false), createActiveMapItem(true)];

      activeMapItems.set(initialItems);

      expect(service.activeMapItemsWithNotices()).toBe(initialItems);

      activeMapItems.set(updatedItems);

      expect(service.activeMapItemsWithNotices()).toBe(updatedItems);
    });

    it('selects the expected selector from the store', () => {
      expect(store.selectSignal).toHaveBeenCalledExactlyOnceWith(selectGb2WmsActiveMapItemsWithMapNotices);
    });
  });

  describe('numberOfNotices', () => {
    it('is zero when there are no active map items with notices', () => {
      expect(service.numberOfNotices()).toBe(0);
    });

    it('returns the number of active map items with notices', () => {
      activeMapItems.set([createActiveMapItem(false), createActiveMapItem(true), createActiveMapItem(false)]);

      expect(service.numberOfNotices()).toBe(3);
    });

    it('updates when active map items change', () => {
      activeMapItems.set([createActiveMapItem(false)]);

      expect(service.numberOfNotices()).toBe(1);

      activeMapItems.set([createActiveMapItem(false), createActiveMapItem(true)]);

      expect(service.numberOfNotices()).toBe(2);

      activeMapItems.set([]);

      expect(service.numberOfNotices()).toBe(0);
    });
  });

  describe('numberOfUnreadNotices', () => {
    it('is zero when there are no notices', () => {
      expect(service.numberOfUnreadNotices()).toBe(0);
    });

    it('is zero when all notices are marked as read', () => {
      activeMapItems.set([createActiveMapItem(true), createActiveMapItem(true), createActiveMapItem(true)]);

      expect(service.numberOfUnreadNotices()).toBe(0);
    });

    it('counts unread notices', () => {
      activeMapItems.set([createActiveMapItem(false), createActiveMapItem(true), createActiveMapItem(false), createActiveMapItem(true)]);

      expect(service.numberOfUnreadNotices()).toBe(2);
    });

    it('counts all notices as unread when none are marked as read', () => {
      activeMapItems.set([createActiveMapItem(false), createActiveMapItem(false), createActiveMapItem(false)]);

      expect(service.numberOfUnreadNotices()).toBe(3);
    });

    it('updates when notice read state changes', () => {
      const items = [createActiveMapItem(false), createActiveMapItem(true)];

      activeMapItems.set(items);

      expect(service.numberOfUnreadNotices()).toBe(1);

      activeMapItems.set([createActiveMapItem(true), createActiveMapItem(true)]);

      expect(service.numberOfUnreadNotices()).toBe(0);
    });
  });

  describe('skipAutoOpeningOfMapNotices', () => {
    it('watches the expected local-storage key', () => {
      expect(localStorageService.watch).toHaveBeenCalledExactlyOnceWith('skipAutoOpeningOfMapNotices' as LocalStorageKey);
    });

    it('exposes the local-storage signal', () => {
      skipAutoOpening.set('1');

      expect(service.skipAutoOpeningOfMapNotices()).toBe('1');

      skipAutoOpening.set('0');

      expect(service.skipAutoOpeningOfMapNotices()).toBe('0');
    });
  });

  describe('shouldAutoOpen', () => {
    it('is false when there are no unread notices', () => {
      activeMapItems.set([]);

      expect(service.shouldAutoOpen()).toBe(false);
    });

    it('is false when all notices are read', () => {
      activeMapItems.set([createActiveMapItem(true), createActiveMapItem(true)]);

      expect(service.shouldAutoOpen()).toBe(false);
    });

    it('is true when there is an unread notice and auto-opening is enabled', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      expect(service.shouldAutoOpen()).toBe(true);
    });

    it('is true when there is an unread notice and the skip value is absent', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set(null);

      expect(service.shouldAutoOpen()).toBe(true);
    });

    it('is false when auto-opening is explicitly disabled', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('1');

      expect(service.shouldAutoOpen()).toBe(false);
    });

    it('is false while the onboarding guide is shown', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');
      onboardingGuideService.isGuideShown.mockReturnValue(true);

      expect(service.shouldAutoOpen()).toBe(false);
    });

    it('is true when the onboarding guide is not shown', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');
      onboardingGuideService.isGuideShown.mockReturnValue(false);

      expect(service.shouldAutoOpen()).toBe(true);
    });

    it('requires both an unread notice and auto-opening to be enabled', () => {
      activeMapItems.set([]);
      skipAutoOpening.set('0');

      expect(service.shouldAutoOpen()).toBe(false);

      activeMapItems.set([createActiveMapItem(false)]);

      expect(service.shouldAutoOpen()).toBe(true);

      skipAutoOpening.set('1');

      expect(service.shouldAutoOpen()).toBe(false);
    });

    it('reacts to changes in the onboarding guide state', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');
      onboardingGuideService.isGuideShown.mockReturnValue(true);

      expect(service.shouldAutoOpen()).toBe(false);

      onboardingGuideService.isGuideShown.mockReturnValue(false);

      /*
       * isGuideShown() is not itself a signal in the service, so changing
       * the mock return value does not invalidate the computed signal.
       *
       * This test documents that behavior rather than pretending the
       * computed signal can react to a non-reactive dependency.
       */
      expect(service.shouldAutoOpen()).toBe(false);
    });
  });

  describe('constructor effect', () => {
    it('does not open the map notices dialog when auto-opening is disabled', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('1');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('does not open the map notices dialog when there are no unread notices', () => {
      activeMapItems.set([createActiveMapItem(true)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('does not open the map notices dialog while the onboarding guide is shown', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');
      onboardingGuideService.isGuideShown.mockReturnValue(true);

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('opens the map notices dialog when there is an unread notice', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });

    it('opens the map notices dialog when the skip value is absent', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set(null);

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });

    it('reacts when an unread notice appears', () => {
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();

      activeMapItems.set([createActiveMapItem(false)]);

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });

    it('reacts when auto-opening is enabled after initially being disabled', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('1');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();

      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });

    it('does not repeatedly open the dialog when nothing changes', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);

      TestBed.tick();
      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('opens the dialog again when notices disappear and subsequently reappear', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);

      activeMapItems.set([]);
      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);

      activeMapItems.set([createActiveMapItem(false)]);
      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('does not open the dialog when an unread notice changes to read', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);

      activeMapItems.set([createActiveMapItem(true)]);
      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('opens the dialog again when a read notice becomes unread', () => {
      activeMapItems.set([createActiveMapItem(true)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();

      activeMapItems.set([createActiveMapItem(false)]);
      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });
  });

  describe('openMapNotices', () => {
    it('dispatches the show-map-notices-dialog action', () => {
      service.openMapNotices();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });

    it('dispatches a fresh action each time it is called', () => {
      service.openMapNotices();
      service.openMapNotices();

      expect(store.dispatch).toHaveBeenCalledTimes(2);
      expect(store.dispatch).toHaveBeenNthCalledWith(1, MapUiActions.showMapNoticesDialog());
      expect(store.dispatch).toHaveBeenNthCalledWith(2, MapUiActions.showMapNoticesDialog());
    });
  });

  describe('disableAutoOpening', () => {
    it('stores the disabled value', () => {
      service.disableAutoOpening();

      expect(localStorageService.set).toHaveBeenCalledExactlyOnceWith('skipAutoOpeningOfMapNotices' as LocalStorageKey, '1');
    });
  });

  describe('enableAutoOpening', () => {
    it('stores the enabled value', () => {
      service.enableAutoOpening();

      expect(localStorageService.set).toHaveBeenCalledExactlyOnceWith('skipAutoOpeningOfMapNotices' as LocalStorageKey, '0');
    });
  });

  describe('auto-opening integration', () => {
    it('can disable auto-opening and subsequently prevent the effect from opening the dialog', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledTimes(1);

      store.dispatch.mockClear();

      service.disableAutoOpening();

      skipAutoOpening.set('1');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('can enable auto-opening and subsequently allow the effect to open the dialog', () => {
      activeMapItems.set([createActiveMapItem(false)]);
      skipAutoOpening.set('1');

      TestBed.tick();

      expect(store.dispatch).not.toHaveBeenCalled();

      service.enableAutoOpening();

      skipAutoOpening.set('0');

      TestBed.tick();

      expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(MapUiActions.showMapNoticesDialog());
    });
  });
});
