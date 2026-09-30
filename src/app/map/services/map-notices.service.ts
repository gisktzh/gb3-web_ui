import {Injectable, computed, effect, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {LocalStorageService} from 'src/app/shared/services/local-storage.service';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectGb2WmsActiveMapItemsWithMapNotices} from 'src/app/state/map/selectors/active-map-items.selector';

@Injectable({providedIn: 'root'})
export class MapNoticesService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly store = inject(Store);

  public readonly activeMapItemsWithNotices = this.store.selectSignal(selectGb2WmsActiveMapItemsWithMapNotices);
  public readonly numberOfNotices = computed(() => this.activeMapItemsWithNotices().length);
  public readonly numberOfUnreadNotices = computed(
    () => this.activeMapItemsWithNotices().filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length,
  );

  public readonly skipAutoOpeningOfMapNotices = this.localStorageService.watch('skipAutoOpeningOfMapNotices');

  public readonly shouldAutoOpen = computed(() => {
    return this.skipAutoOpeningOfMapNotices() !== '1' && this.numberOfUnreadNotices() > 0;
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
    return this.localStorageService.set('skipAutoOpeningOfMapNotices', '1');
  }

  public enableAutoOpening() {
    return this.localStorageService.set('skipAutoOpeningOfMapNotices', '0');
  }
}
