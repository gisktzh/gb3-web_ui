import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectLoadingState as selectFavouritesLoadingState} from '../../../state/map/reducers/favourite-list.reducer';
import {selectFilterString, selectLoadingState as selectCatalogueLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {distinctUntilChanged, Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state.type';
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
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {MapCouldNotBeFound} from '../../../shared/errors/map.errors';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

@Component({
  selector: 'map-data-catalogue',
  templateUrl: './map-data-catalogue.component.html',
  styleUrls: ['./map-data-catalogue.component.scss'],
})
export class MapDataCatalogueComponent implements OnInit, OnDestroy {
  @Output() public readonly changeIsMinimizedEvent = new EventEmitter<boolean>();

  public topics: Topic[] = [];
  public catalogueLoadingState: LoadingState;
  public favouritesLoadingState: LoadingState;
  public filterString: string | undefined = undefined;
  public filteredFavourites: Favourite[] = [];
  public isAuthenticated: boolean = false;
  public isMinimized = false;
  public screenMode: ScreenMode = 'regular';

  private originalMaps: Map[] = [];
  private readonly filterString$ = this.store.select(selectFilterString);
  private readonly catalogueLoadingState$ = this.store.select(selectCatalogueLoadingState);
  private readonly favouritesLoadingState$ = this.store.select(selectFavouritesLoadingState);
  private readonly filteredFavourites$ = this.store.select(selectFilteredFavouriteList);
  private readonly topics$ = this.store.select(selectFilteredLayerCatalog);
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions = new Subscription();
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(
    private readonly store: Store,
    private readonly favouritesService: FavouritesService,
  ) {
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();

    // make sure our filterstring is properly cleaned to avoid NG100 on navigation
    this.store.dispatch(LayerCatalogActions.clearFilterString());
  }

  /**
   * Dispatches an action that adds a favourite to the map.
   */
  public addFavouriteToMap({id, content, drawings, measurements, baseConfig}: Favourite) {
    try {
      const activeMapItemsForFavourite = this.favouritesService.getActiveMapItemsForFavourite(drawings.content!); // TODO GB3-645: revert to "content" once API delivers this
      const {drawingsToAdd, drawingActiveMapItems} = this.favouritesService.getDrawingsForFavourite(drawings, measurements);

      this.store.dispatch(
        ActiveMapItemActions.addFavourite({
          activeMapItems: [...drawingActiveMapItems, ...activeMapItemsForFavourite],
          baseConfig: baseConfig,
          drawingsToAdd,
        }),
      );
    } catch (e) {
      this.store.dispatch(FavouriteListActions.setInvalid({id}));
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
    if (this.filterString !== '') {
      const originalActiveMap = this.originalMaps.find((originalMap) => originalMap.id === activeMap.id);
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

  public trackByTopicTitle(index: number, item: Topic) {
    return item.title;
  }

  public trackByMapId(index: number, item: Map) {
    return item.id;
  }

  public toggleMinimizeMapDataCatalogue() {
    this.isMinimized = !this.isMinimized;
    this.changeIsMinimizedEvent.emit(this.isMinimized);
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.topics$
        .pipe(
          tap((topics) => {
            this.topics = topics;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.catalogueLoadingState$
        .pipe(
          tap((value) => {
            this.catalogueLoadingState = value;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.favouritesLoadingState$
        .pipe(
          tap((value) => {
            this.favouritesLoadingState = value;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.filterString$
        .pipe(
          tap((value) => {
            this.filterString = value;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.originalMaps$
        .pipe(
          tap((value) => {
            this.originalMaps = value;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          distinctUntilChanged(),
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;

            // This check is currently needed, because isAuthenticated might not be initialized yet
            if (this.isAuthenticated) {
              this.store.dispatch(FavouriteListActions.loadFavourites());
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(this.filteredFavourites$.pipe(tap((favourites) => (this.filteredFavourites = favourites))).subscribe());
  }
}
