import {Component, OnDestroy, computed, inject, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {isActiveMapItemOfType} from 'src/app/shared/type-guards/active-map-item-type.type-guard';
import {selectIsAuthenticated} from 'src/app/state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from 'src/app/state/map/actions/active-map-item.actions';
import {LayerCatalogActions} from 'src/app/state/map/actions/layer-catalog.actions';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectItems} from 'src/app/state/map/selectors/active-map-items.selector';
import {selectFilterString} from 'src/app/state/map/reducers/layer-catalog.reducer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {MatButton, MatIconButton} from '@angular/material/button';

import {MatBadge} from '@angular/material/badge';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {NotificationIndicatorComponent} from '../notification-indicator/notification-indicator.component';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatTooltip} from '@angular/material/tooltip';
import {ActiveMapItemsComponent} from '../active-map-items/active-map-items.component';
import {MapDataCatalogueComponent} from '../map-data-catalogue/map-data-catalogue.component';

type TabType = 'activeMaps' | 'mapsCatalogue';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Um einen Favoriten anzulegen, muss mindestens eine Karte hinzugefügt werden.',
  notAuthenticated: 'Um aktive Karten als Favorit speichern zu können, muss man angemeldet sein.',
  authenticatedAndMapsAdded: 'Aktive Karten als Favorit speichern',
};

@Component({
  selector: 'map-management-mobile',
  templateUrl: './map-management-mobile.component.html',
  styleUrls: ['./map-management-mobile.component.scss'],
  imports: [
    MatButton,
    MatBadge,
    SearchInputComponent,
    MatIconButton,
    NotificationIndicatorComponent,
    MatIcon,
    MatDivider,
    MatTooltip,
    ActiveMapItemsComponent,
    MapDataCatalogueComponent,
  ],
})
export class MapManagementMobileComponent implements OnDestroy {
  private readonly store = inject(Store);

  public readonly activeMapItems = this.store.selectSignal(selectItems);
  public readonly activeTab = signal<TabType>('mapsCatalogue');
  public readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  public readonly filterString = this.store.selectSignal(selectFilterString);
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  public readonly gb2ActiveMapItems = computed(() => {
    return this.activeMapItems().filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
  });
  public readonly numberOfNotices = computed(() => {
    return this.gb2ActiveMapItems().filter((activeMapItem) => activeMapItem.settings.notice).length;
  });
  public readonly numberOfUnreadNotices = computed(() => {
    return this.gb2ActiveMapItems().filter((activeMapItem) => activeMapItem.settings.notice && !activeMapItem.settings.isNoticeMarkedAsRead)
      .length;
  });

  constructor() {
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.clearInput();
  }

  public changeTabs(tab: TabType) {
    this.activeTab.set(tab);
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public showFavouriteDialog() {
    this.store.dispatch(MapUiActions.showCreateFavouriteDialog());
  }

  public showMapNotices() {
    this.store.dispatch(MapUiActions.showMapNoticesDialog());
  }

  public filterCatalog(filterString: string) {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString}));
  }

  public clearInput() {
    this.store.dispatch(LayerCatalogActions.clearFilterString());
  }

  public startFiltering() {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString: ''}));
  }
}
