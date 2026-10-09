import {Injectable, computed, effect, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {OnboardingGuideService} from 'src/app/onboarding-guide/services/onboarding-guide.service';
import {LocalStorageService} from 'src/app/shared/services/local-storage.service';
import {LocalStorageKey} from 'src/app/shared/types/local-storage-key.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectGb2WmsActiveMapItemsWithMapNotices} from 'src/app/state/map/selectors/active-map-items.selector';

const SKIP_AUTO_OPENING_LOCALE_STORAGE_KEY: LocalStorageKey = 'skipAutoOpeningOfMapNotices' as LocalStorageKey;

@Injectable()
export class MapNoticesService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly store = inject(Store);
  private readonly onboardingGuideService = inject(OnboardingGuideService);

  public readonly activeMapItemsWithNotices = this.store.selectSignal(selectGb2WmsActiveMapItemsWithMapNotices);
  public readonly numberOfNotices = computed(() => this.activeMapItemsWithNotices().length);
  public readonly numberOfUnreadNotices = computed(
    () => this.activeMapItemsWithNotices().filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length,
  );

  public readonly skipAutoOpeningOfMapNotices = this.localStorageService.watch(SKIP_AUTO_OPENING_LOCALE_STORAGE_KEY);

  public readonly shouldAutoOpen = computed(() => {
    return this.skipAutoOpeningOfMapNotices() !== '1' && this.numberOfUnreadNotices() > 0 && !this.onboardingGuideService.isGuideShown();
  });

  constructor() {
    effect(() => {
      if (this.shouldAutoOpen()) {
        this.openMapNotices();
      }
    });
  }

  public openMapNotices() {
    this.store.dispatch(MapUiActions.showMapNoticesDialog());
  }

  public disableAutoOpening() {
    return this.localStorageService.set(SKIP_AUTO_OPENING_LOCALE_STORAGE_KEY, '1');
  }

  public enableAutoOpening() {
    return this.localStorageService.set(SKIP_AUTO_OPENING_LOCALE_STORAGE_KEY, '0');
  }
}
