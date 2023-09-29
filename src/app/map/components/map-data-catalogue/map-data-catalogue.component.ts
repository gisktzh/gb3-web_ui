import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectLoadingState as selectFavouritesLoadingState} from '../../../state/map/reducers/favourite-list.reducer';
import {selectFilterString, selectLoadingState as selectCatalogueLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {debounceTime, distinctUntilChanged, fromEvent, Observable, Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Map, MapLayer, Topic} from '../../../shared/interfaces/topic.interface';
import {selectFilteredLayerCatalog} from '../../../state/map/selectors/filtered-layer-catalog.selector';
import {map} from 'rxjs/operators';
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

/**
 * Defines the upper limit (inclusive) of filtered results which trigger an automatic open of the associated expansion panel.
 */
const AUTO_OPEN_THRESHOLD = 3;

@Component({
  selector: 'map-data-catalogue',
  templateUrl: './map-data-catalogue.component.html',
  styleUrls: ['./map-data-catalogue.component.scss'],
})
export class MapDataCatalogueComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() public readonly changeIsMinimizedEvent = new EventEmitter<boolean>();

  public topics: Topic[] = [];
  public catalogueLoadingState: LoadingState = 'undefined';
  public favouritesLoadingState: LoadingState = 'undefined';
  public filterString: string = '';
  public filteredFavourites: Favourite[] = [];
  public isAuthenticated: boolean = false;
  public autoOpenThreshold: number = AUTO_OPEN_THRESHOLD;
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
  }

  public ngAfterViewInit() {
    if (this.screenMode !== 'mobile') {
      this.subscriptions.add(this.filterInputHandler().subscribe());
    }
  }

  /**
   * Dispatches an action that adds a favourite to the map.
   */
  public addFavouriteToMap(favourite: Favourite) {
    try {
      const activeMapItemsForFavourite = this.favouritesService.getActiveMapItemsForFavourite(favourite.content);
      this.store.dispatch(
        ActiveMapItemActions.addFavourite({
          activeMapItems: activeMapItemsForFavourite,
          baseConfig: favourite.baseConfig,
        }),
      );
    } catch (e) {
      this.store.dispatch(FavouriteListActions.setInvalid({id: favourite.id}));
    }
  }

  public deleteFavourite(favourite: Favourite) {
    this.store.dispatch(MapUiActions.showDeleteFavouriteDialog({favouriteToDelete: favourite}));
  }

  /**
   * Adds an activeMap to the map. If a filter is active, takes the original map from the store to avoid adding a filtered, incomplete map.
   * @param activeMap
   */
  public addActiveMap(activeMap: Map) {
    if (this.filterString !== '') {
      const originalActiveMap = this.originalMaps.find((originalMap) => originalMap.id === activeMap.id);
      if (!originalActiveMap) {
        throw new MapCouldNotBeFound(); // although this should never happen here because the item WILL always exist
      }
      activeMap = originalActiveMap;
    }

    this.addActiveItem(ActiveMapItemFactory.createGb2WmsMapItem(activeMap));
  }

  public addActiveLayer(activeMap: Map, layer: MapLayer) {
    this.addActiveItem(ActiveMapItemFactory.createGb2WmsMapItem(activeMap, layer));
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

  private filterInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value),
      distinctUntilChanged(),
      tap((event) => this.filterCatalog(event)),
    );
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

  private filterCatalog(filterString: string) {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString}));
  }
}
