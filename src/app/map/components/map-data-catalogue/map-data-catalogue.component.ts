import {Component, OnDestroy, effect, inject, output, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectLoadingState as selectFavouritesLoadingState} from '../../../state/map/reducers/favourite-list.reducer';
import {selectFilterString, selectLoadingState as selectCatalogueLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Map, MapLayer, Topic} from '../../../shared/interfaces/topic.interface';
import {selectFilteredLayerCatalog} from '../../../state/map/selectors/filtered-layer-catalog.selector';
import {selectMaps} from '../../../state/map/selectors/maps.selector';
import {selectFilteredFavouriteList} from '../../../state/map/selectors/filtered-favourite-list.selector';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {FavouritesService} from '../../services/favourites.service';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {MapCouldNotBeFound} from '../../../shared/errors/map.errors';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MatCard, MatCardHeader} from '@angular/material/card';
import {TypedTourAnchorDirective} from '../../../shared/directives/typed-tour-anchor.directive';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MatAccordion} from '@angular/material/expansion';
import {ExpandableListItemComponent} from '../../../shared/components/expandable-list-item/expandable-list-item.component';
import {MapDataItemFavouriteComponent} from './base-map-data-item/map-data-item-favourite.component';
import {MapDataItemMapComponent} from './base-map-data-item/map-data-item-map.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'map-data-catalogue',
  templateUrl: './map-data-catalogue.component.html',
  styleUrls: ['./map-data-catalogue.component.scss'],
  imports: [
    MatCard,
    TypedTourAnchorDirective,
    MatCardHeader,
    MatIconButton,
    MatIcon,
    SearchInputComponent,
    LoadingAndProcessBarComponent,
    MatAccordion,
    ExpandableListItemComponent,
    MapDataItemFavouriteComponent,
    MapDataItemMapComponent,
    MatDivider,
  ],
})
export class MapDataCatalogueComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly favouritesService = inject(FavouritesService);

  public readonly changeIsMinimizedEvent = output<boolean>();

  public readonly topics = this.store.selectSignal(selectFilteredLayerCatalog);
  public readonly catalogueLoadingState = this.store.selectSignal(selectCatalogueLoadingState);
  public readonly favouritesLoadingState = this.store.selectSignal(selectFavouritesLoadingState);
  public readonly filterString = this.store.selectSignal(selectFilterString);
  public readonly filteredFavourites = this.store.selectSignal(selectFilteredFavouriteList);
  public readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  private readonly originalMaps = this.store.selectSignal(selectMaps);
  public readonly isMinimized = signal(false);

  constructor() {
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
    effect(() => {
      if (this.isAuthenticated()) {
        this.store.dispatch(FavouriteListActions.loadFavourites());
      }
    });
  }

  public ngOnDestroy() {
    this.clearInput();
  }

  /**
   * Dispatches an action that adds a favourite to the map.
   */
  public async addFavouriteToMap({id, content, drawings, measurements, baseConfig}: Favourite) {
    try {
      const activeMapItemsForFavourite = this.favouritesService.getActiveMapItemsForFavourite(content);
      const {drawingsToAdd, drawingActiveMapItems} = await this.favouritesService.getDrawingsForFavourite(drawings, measurements);

      this.store.dispatch(
        ActiveMapItemActions.addFavourite({
          activeMapItems: [...drawingActiveMapItems, ...activeMapItemsForFavourite],
          baseConfig: baseConfig,
          drawingsToAdd,
        }),
      );
    } catch (error) {
      this.store.dispatch(FavouriteListActions.setInvalid({id, error}));
    }
  }

  public deleteFavourite(favourite: Favourite) {
    this.store.dispatch(MapUiActions.showDeleteFavouriteDialog({favouriteToDelete: favourite}));
  }

  /**
   * Adds an activeMap to the map. If a filter is active, takes the original map from the store to avoid adding a filtered, incomplete map.
   * @param activeMap
   * @param isTemporary Temporary items are not shown in the active map items GUI, yet added to the state
   */
  public addActiveMap(activeMap: Map, isTemporary: boolean = false) {
    if (this.filterString() !== '') {
      const originalActiveMap = this.originalMaps().find((originalMap) => originalMap.id === activeMap.id);
      if (!originalActiveMap) {
        throw new MapCouldNotBeFound(); // although this should never happen here because the item WILL always exist
      }
      activeMap = originalActiveMap;
    }

    this.addActiveItem(
      isTemporary ? ActiveMapItemFactory.createTemporaryGb2WmsMapItem(activeMap) : ActiveMapItemFactory.createGb2WmsMapItem(activeMap),
    );
  }

  public addTemporaryMapItem(activeMap: Map, layer: MapLayer | undefined) {
    if (layer) {
      this.addActiveLayer(activeMap, layer, true);
    } else {
      this.addActiveMap(activeMap, true);
    }
  }

  public removeTemporaryMapItem(activeMap: Map, layer?: MapLayer) {
    const item = ActiveMapItemFactory.createTemporaryGb2WmsMapItem(activeMap, layer);
    this.store.dispatch(ActiveMapItemActions.removeTemporaryActiveMapItem({activeMapItem: item}));
  }

  public addActiveLayer(activeMap: Map, layer: MapLayer, isTemporary: boolean = false) {
    this.addActiveItem(
      isTemporary
        ? ActiveMapItemFactory.createTemporaryGb2WmsMapItem(activeMap, layer)
        : ActiveMapItemFactory.createGb2WmsMapItem(activeMap, layer),
    );
  }

  public trackByTopicTitle(_: number, item: Topic) {
    return item.title;
  }

  public trackByMapId(_: number, item: Map) {
    return item.id;
  }

  public toggleMinimizeMapDataCatalogue() {
    this.isMinimized.set(!this.isMinimized());
    this.changeIsMinimizedEvent.emit(this.isMinimized());
  }

  public filterCatalog(filterString: string) {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString}));
  }

  public clearInput() {
    this.store.dispatch(LayerCatalogActions.clearFilterString());
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }
}
