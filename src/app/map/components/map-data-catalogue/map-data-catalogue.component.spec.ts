import {ComponentFixture, DeferBlockState, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectFilteredLayerCatalog} from '../../../state/map/selectors/filtered-layer-catalog.selector';
import {selectLoadingState as selectCatalogueLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {selectLoadingState as selectFavouritesLoadingState} from '../../../state/map/reducers/favourite-list.reducer';
import {selectFilterString} from '../../../state/map/reducers/layer-catalog.reducer';
import {selectFilteredFavouriteList} from '../../../state/map/selectors/filtered-favourite-list.selector';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectMaps} from '../../../state/map/selectors/maps.selector';
import {ConfigService} from 'src/app/shared/services/config.service';
import {FavouritesService} from '../../services/favourites.service';
import {Map, MapLayer, Topic} from '../../../shared/interfaces/topic.interface';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {MapDataCatalogueComponent} from './map-data-catalogue.component';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {FavouriteListActions} from '../../../state/map/actions/favourite-list.actions';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {MapConfigActions} from '../../../state/map/actions/map-config.actions';
import {Basemap, WmsBasemap} from 'src/app/shared/interfaces/basemap.interface';
import {Gb3StyledInternalDrawingRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {DrawingActiveMapItem} from '../../models/implementations/drawing.model';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {Component, input} from '@angular/core';
import {ExpandableListItemComponent} from 'src/app/shared/components/expandable-list-item/expandable-list-item.component';
import {By} from '@angular/platform-browser';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {MapDataItemMapComponent} from './base-map-data-item/map-data-item-map.component';
import {MatDivider} from '@angular/material/divider';
import {MapDataItemFavouriteComponent} from './base-map-data-item/map-data-item-favourite.component';

describe('MapDataCatalogueComponent', () => {
  let component: MapDataCatalogueComponent;
  let fixture: ComponentFixture<MapDataCatalogueComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const configServiceMock: Partial<ConfigService & {basemapConfig: object}> = {
    basemapConfig: {
      availableBasemaps: [],
      defaultBasemap: vi.fn(class {}) as unknown as WmsBasemap,
    },
  };

  const favouritesServiceMock: Partial<FavouritesService> = {
    getActiveMapItemsForFavourite: vi.fn(),
    getDrawingsForFavourite: vi.fn(),
  };

  let changeIsMinimizedEventSpy: Mock;

  const mapLayer: MapLayer = {
    id: 1,
    title: 'Layer 1',
    layer: '',
    uuid: null,
    groupTitle: null,
    minScale: 0,
    maxScale: 0,
    wmsSort: 0,
    tocSort: 0,
    queryable: false,
    visible: false,
    isHidden: false,
  };

  const map: Map = {
    id: 'map-1',
    title: 'Map 1',
    layers: [mapLayer],
    icon: 'map-icon.png',
    gb2Url: null,
    uuid: '1',
    printTitle: '1st',
    organisation: 'yes',
    keywords: ['test', '1'],
    wmsUrl: 'https://example.com/wms/1',
    minScale: -1,
    notice: 'no',
    opacity: 0.5,
    timeSliderConfiguration: undefined,
    initialTimeSliderExtent: undefined,
  };

  const secondMap: Map = {
    id: 'map-2',
    title: 'Map 2',
    layers: [],
    icon: '',
    gb2Url: null,
    uuid: '2',
    printTitle: '2nd',
    organisation: 'yes',
    keywords: ['test', '2'],
    wmsUrl: 'https://example.com/wms/2',
    minScale: -1,
    notice: 'no',
    opacity: 0.5,
    timeSliderConfiguration: undefined,
    initialTimeSliderExtent: undefined,
  };

  const topic: Topic = {
    title: 'Topic 1',
    maps: [map, secondMap],
  };

  const favourite: Favourite = {
    id: 'favourite-1',
    title: 'Favourite 1',
    content: [],
    drawings: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      styles: [],
    },
    measurements: {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      styles: [],
    },
    baseConfig: {
      basemap: 'yes',
      center: {x: 0, y: 0},
      scale: 1,
    },
  };

  @Component({
    selector: 'expandable-list-item',
    template: '<ng-content />',
  })
  class MockExpandableListItemComponent {
    public readonly header = input<string>();
    public readonly expanded = input<boolean>();
    public readonly loadingState = input<LoadingState>();
    public readonly numberOfItems = input<number>();
    public readonly disabled = input<boolean>();
    public readonly showBadge = input<boolean>();
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    configServiceMock.basemapConfig = {
      availableBasemaps: [],
      defaultBasemap: vi.fn(class {}) as unknown as WmsBasemap,
    };

    await TestBed.configureTestingModule({
      imports: [MapDataCatalogueComponent],
      providers: [
        {provide: ConfigService, useValue: configServiceMock},
        {provide: FavouritesService, useValue: favouritesServiceMock},
        provideMockStore(),
        provideUiTour(),
      ],
    })
      .overrideComponent(MapDataCatalogueComponent, {
        remove: {
          imports: [ExpandableListItemComponent],
        },
        add: {
          imports: [MockExpandableListItemComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectFilteredLayerCatalog, []);
    store.overrideSelector(selectCatalogueLoadingState, 'loaded');
    store.overrideSelector(selectFavouritesLoadingState, 'loaded');
    store.overrideSelector(selectFilterString, '');
    store.overrideSelector(selectFilteredFavouriteList, []);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectMaps, []);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapDataCatalogueComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    changeIsMinimizedEventSpy = vi.spyOn(component.changeIsMinimizedEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should load the layer catalogue', () => {
      expect(storeDispatchSpy).toHaveBeenCalledWith(LayerCatalogActions.loadLayerCatalog());
    });

    it('should load favourites when the user is authenticated', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.refreshState();
      fixture.detectChanges();

      expect(storeDispatchSpy).toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
    });

    it('should not load favourites when the user is not authenticated', () => {
      expect(storeDispatchSpy).not.toHaveBeenCalledWith(FavouriteListActions.loadFavourites());
    });
  });

  describe('rendering', () => {
    it('should render the catalogue header on regular screens', () => {
      expect(compiled.querySelector('.map-data-catalogue__header__title')?.textContent).toContain('Kartenkatalog');
    });

    it('should not render the catalogue header on mobile screens', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-catalogue__header')).toBeNull();
    });

    it('should hide the catalogue shadow on mobile screens', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-catalogue')?.classList.contains('map-data-catalogue--hide-shadow')).toBe(true);
    });

    it('should render the search input on regular screens', () => {
      expect(compiled.querySelector('.map-data-catalogue__content__filter')).not.toBeNull();
    });

    it('should not render the search input on mobile screens', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-catalogue__content__filter')).toBeNull();
    });

    it('should render the loading bar', () => {
      expect(compiled.querySelector('loading-and-process-bar')).not.toBeNull();
    });

    it('should render the accordion when catalogue loading is complete', () => {
      expect(compiled.querySelector('.map-data-catalogue__content__items')).not.toBeNull();
    });

    it('should not render the accordion while the catalogue is loading', () => {
      store.overrideSelector(selectCatalogueLoadingState, 'loading');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-catalogue__content__items')).toBeNull();
    });

    it('should render topics', () => {
      store.overrideSelector(selectFilteredLayerCatalog, [topic]);
      store.refreshState();
      fixture.detectChanges();

      const items = fixture.debugElement
        .queryAll(By.directive(MockExpandableListItemComponent))
        .map((e) => e.componentInstance) as MockExpandableListItemComponent[];

      expect(items).toHaveLength(1);
      expect(items[0].header()).toBe('Topic 1');
    });

    it('should render both maps of a topic', async () => {
      store.overrideSelector(selectFilteredLayerCatalog, [topic]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      const maps = fixture.debugElement.queryAll(By.directive(MapDataItemMapComponent));

      expect(maps).toHaveLength(2);
    });

    it('should render a divider between maps but not after the last map', async () => {
      store.overrideSelector(selectFilteredLayerCatalog, [topic]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      expect(fixture.debugElement.queryAll(By.directive(MatDivider))).toHaveLength(1);
    });

    it('should render no topic items when there are no topics', async () => {
      store.overrideSelector(selectFilteredLayerCatalog, []);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      expect(fixture.debugElement.queryAll(By.directive(MockExpandableListItemComponent))).toHaveLength(0);
      expect(fixture.debugElement.queryAll(By.directive(MapDataItemMapComponent))).toHaveLength(0);
    });
  });

  describe('favourites', () => {
    beforeEach(async () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectFilteredFavouriteList, [favourite]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));
    });

    it('should render the favourites list for authenticated users', () => {
      expect(fixture.debugElement.query(By.directive(MapDataItemFavouriteComponent))).not.toBeNull();
    });

    it('should not render the favourites list for unauthenticated users', () => {
      store.overrideSelector(selectIsAuthenticated, false);
      store.refreshState();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(MapDataItemFavouriteComponent))).toBeNull();
    });

    it('should not render favourites when filtering produces no favourites', () => {
      store.overrideSelector(selectFilterString, 'does-not-exist');
      store.overrideSelector(selectFilteredFavouriteList, []);
      store.refreshState();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(MapDataItemFavouriteComponent))).toBeNull();
    });

    it('should render the empty favourites message when the filtered favourite list is empty and no filter is active', () => {
      store.overrideSelector(selectFilteredFavouriteList, []);
      store.overrideSelector(selectFilterString, '');
      store.refreshState();
      fixture.detectChanges();

      const emptyMessage = compiled.querySelector('expandable-list-item p em');

      expect(emptyMessage?.textContent).toContain('Noch keine Favoriten hinzugefügt.');
    });
  });

  describe('filtering', () => {
    it('should dispatch the filter action when filterCatalog is called', () => {
      component.filterCatalog('roads');

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        LayerCatalogActions.setFilterString({
          filterString: 'roads',
        }),
      );
    });

    it('should dispatch the clear action when clearInput is called', () => {
      component.clearInput();

      expect(storeDispatchSpy).toHaveBeenCalledWith(LayerCatalogActions.clearFilterString());
    });

    it('should show the no-results message when a filter has no results', () => {
      store.overrideSelector(selectFilterString, 'does-not-exist');
      store.overrideSelector(selectFilteredLayerCatalog, []);
      store.overrideSelector(selectFilteredFavouriteList, []);
      store.refreshState();
      fixture.detectChanges();

      const noResults = compiled.querySelector('.map-data-catalogue__content__filter-no-results');

      expect(noResults?.textContent).toContain('Keine Resultate zu diesem Filter.');
    });

    it('should hide the no-results message when the filter is empty', () => {
      store.overrideSelector(selectFilterString, '');
      store.overrideSelector(selectFilteredLayerCatalog, []);
      store.overrideSelector(selectFilteredFavouriteList, []);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.map-data-catalogue__content__filter-no-results')).toBeNull();
    });
  });

  describe('minimize', () => {
    it('should initially show the expanded header state', () => {
      const button = compiled.querySelector('.map-data-catalogue__header button') as HTMLButtonElement;

      expect(button.getAttribute('aria-label')).toBe('Zuklappen');

      const icon = button.querySelector('mat-icon');

      expect(icon?.getAttribute('fonticon')).toBe('arrow_drop_up');
    });

    it('should minimize the catalogue when the header button is clicked', () => {
      const button = compiled.querySelector('.map-data-catalogue__header button') as HTMLButtonElement;

      button.click();
      fixture.detectChanges();

      expect(component.isMinimized()).toBe(true);
      expect(changeIsMinimizedEventSpy).toHaveBeenCalledWith(true);

      expect(compiled.querySelector('.map-data-catalogue__content')?.classList.contains('map-data-catalogue__content--hidden')).toBe(true);

      expect(button.getAttribute('aria-label')).toBe('Aufklappen');
      expect(button.querySelector('mat-icon')?.getAttribute('fonticon')).toBe('arrow_drop_down');
    });

    it('should expand the catalogue again when the header button is clicked twice', () => {
      const button = compiled.querySelector('.map-data-catalogue__header button') as HTMLButtonElement;

      button.click();
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();

      expect(component.isMinimized()).toBe(false);
      expect(changeIsMinimizedEventSpy).toHaveBeenNthCalledWith(1, true);
      expect(changeIsMinimizedEventSpy).toHaveBeenNthCalledWith(2, false);

      expect(compiled.querySelector('.map-data-catalogue__content')?.classList.contains('map-data-catalogue__content--hidden')).toBe(false);
    });

    it('should toggle the minimized state when toggleMinimizeMapDataCatalogue is called', () => {
      expect(component.isMinimized()).toBe(false);

      component.toggleMinimizeMapDataCatalogue();

      expect(component.isMinimized()).toBe(true);
      expect(changeIsMinimizedEventSpy).toHaveBeenCalledWith(true);

      component.toggleMinimizeMapDataCatalogue();

      expect(component.isMinimized()).toBe(false);
      expect(changeIsMinimizedEventSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('favourite actions', () => {
    it('should dispatch the delete favourite dialog action', () => {
      component.deleteFavourite(favourite);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        MapUiActions.showDeleteFavouriteDialog({
          favouriteToDelete: favourite,
        }),
      );
    });

    it('should dispatch addFavourite with the generated active map items', async () => {
      const activeMapItems: ActiveMapItem[] = [];
      const drawingActiveMapItems: DrawingActiveMapItem[] = [];
      const drawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [];

      vi.mocked(favouritesServiceMock.getActiveMapItemsForFavourite!).mockReturnValue(activeMapItems);

      vi.mocked(favouritesServiceMock.getDrawingsForFavourite!).mockResolvedValue({
        drawingsToAdd,
        drawingActiveMapItems,
      });

      await component.addFavouriteToMap(favourite);

      expect(favouritesServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledWith(favourite.content);

      expect(favouritesServiceMock.getDrawingsForFavourite).toHaveBeenCalledWith(favourite.drawings, favourite.measurements);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addFavourite({
          activeMapItems: [...drawingActiveMapItems, ...activeMapItems],
          baseConfig: favourite.baseConfig,
          drawingsToAdd,
        }),
      );
    });

    it('should dispatch setInvalid when adding a favourite fails', async () => {
      const error = new Error('Unable to add favourite');

      vi.mocked(favouritesServiceMock.getActiveMapItemsForFavourite!).mockImplementation(() => {
        throw error;
      });

      await component.addFavouriteToMap(favourite);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        FavouriteListActions.setInvalid({
          id: favourite.id,
          error,
        }),
      );
    });

    it('should add a favourite through the rendered favourite component', async () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectFilteredFavouriteList, [favourite]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      const favouriteItem = fixture.debugElement.query(By.directive(MapDataItemFavouriteComponent))
        .componentInstance as MapDataItemFavouriteComponent;
      expect(favouriteItem).not.toBeNull();

      favouriteItem.addEvent.emit();

      fixture.detectChanges();

      expect(favouritesServiceMock.getActiveMapItemsForFavourite).toHaveBeenCalledWith(favourite.content);
    });

    it('should delete a favourite through the rendered favourite component', async () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectFilteredFavouriteList, [favourite]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      const favouriteItem = fixture.debugElement.query(By.directive(MapDataItemFavouriteComponent))
        .componentInstance as MapDataItemFavouriteComponent;
      expect(favouriteItem).not.toBeNull();

      favouriteItem.deleteEvent.emit();
      fixture.detectChanges();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        MapUiActions.showDeleteFavouriteDialog({
          favouriteToDelete: favourite,
        }),
      );
    });
  });

  describe('active maps', () => {
    it('should add an active map', () => {
      component.addActiveMap(map);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });

    it('should add a temporary active map without applying a default basemap', () => {
      component.addActiveMap(map, true);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(MapConfigActions.setBasemap(expect.anything()));
    });

    it('should use the original map when adding a filtered map', () => {
      store.overrideSelector(selectFilterString, 'filter');
      store.overrideSelector(selectMaps, [map]);
      store.refreshState();
      fixture.detectChanges();

      component.addActiveMap(map);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });

    it('should throw when a filtered map is not found in the original maps', () => {
      store.overrideSelector(selectFilterString, 'filter');
      store.overrideSelector(selectMaps, []);
      store.refreshState();
      fixture.detectChanges();

      expect(() => component.addActiveMap(map)).toThrow();
    });

    it('should add a temporary layer through addTemporaryMapItem', () => {
      component.addTemporaryMapItem(map, mapLayer);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });

    it('should add a temporary map when addTemporaryMapItem has no layer', () => {
      component.addTemporaryMapItem(map, undefined);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });

    it('should remove a temporary map item', () => {
      component.removeTemporaryMapItem(map);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.removeTemporaryActiveMapItem({
          activeMapItem: expect.anything(),
        }),
      );
    });

    it('should remove a temporary map layer item', () => {
      component.removeTemporaryMapItem(map, mapLayer);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.removeTemporaryActiveMapItem({
          activeMapItem: expect.anything(),
        }),
      );
    });

    it('should add a regular active layer', () => {
      component.addActiveLayer(map, mapLayer);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });

    it('should add a temporary active layer', () => {
      component.addActiveLayer(map, mapLayer, true);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.addActiveMapItem({
          activeMapItem: expect.anything(),
          position: 0,
        }),
      );
    });
  });

  describe('default basemap', () => {
    it('should apply the default basemap configured for the map', () => {
      configServiceMock.basemapConfig = {
        availableBasemaps: [
          {
            id: 'basemap-1',
            defaultForTopics: [map.id],
          } as unknown as Basemap,
        ],
        defaultBasemap: vi.fn(class {}) as unknown as WmsBasemap,
      };

      component.addActiveMap(map);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        MapConfigActions.setBasemap({
          activeBasemapId: 'basemap-1',
        }),
      );
    });

    it('should not set a basemap when no configured basemap matches the map', () => {
      configServiceMock.basemapConfig = {
        availableBasemaps: [
          {
            id: 'basemap-1',
            defaultForTopics: ['asdf'],
          } as unknown as Basemap,
        ],
        defaultBasemap: vi.fn(class {}) as unknown as WmsBasemap,
      };

      fixture.detectChanges();

      component.addActiveMap(map);

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(
        MapConfigActions.setBasemap({
          activeBasemapId: 'basemap-1',
        }),
      );
    });

    it('should not set a basemap when a basemap has no default topics', () => {
      configServiceMock.basemapConfig = {
        availableBasemaps: [
          {
            id: 'basemap-1',
            defaultForTopics: [],
          } as unknown as Basemap,
        ],
        defaultBasemap: vi.fn(class {}) as unknown as WmsBasemap,
      };

      fixture.detectChanges();

      component.addActiveMap(map);

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(
        MapConfigActions.setBasemap({
          activeBasemapId: 'basemap-1',
        }),
      );
    });
  });

  describe('child component events', () => {
    beforeEach(async () => {
      store.overrideSelector(selectFilteredLayerCatalog, [topic]);
      store.refreshState();
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));
    });

    it('should add a map when the map add event is emitted', () => {
      const addActiveMapSpy = vi.spyOn(component, 'addActiveMap');

      const mapItem: MapDataItemMapComponent = fixture.debugElement.query(By.directive(MapDataItemMapComponent))?.componentInstance;

      expect(mapItem).toBeDefined();

      mapItem.addEvent.emit();

      fixture.detectChanges();

      expect(addActiveMapSpy).toHaveBeenCalledWith(map);
    });

    it('should add a layer when the map layer add event is emitted', () => {
      const addActiveLayerSpy = vi.spyOn(component, 'addActiveLayer');

      const mapItem: MapDataItemMapComponent = fixture.debugElement.query(By.directive(MapDataItemMapComponent))?.componentInstance;

      expect(mapItem).toBeDefined();

      mapItem.addLayerEvent.emit(mapLayer);

      fixture.detectChanges();

      expect(addActiveLayerSpy).toHaveBeenCalledWith(map, mapLayer);
    });

    it('should add a temporary map item when hover starts', () => {
      const addTemporaryMapItemSpy = vi.spyOn(component, 'addTemporaryMapItem');

      const mapItem: MapDataItemMapComponent = fixture.debugElement.query(By.directive(MapDataItemMapComponent))?.componentInstance;

      expect(mapItem).toBeDefined();

      mapItem.hoverStartEvent.emit(mapLayer);

      fixture.detectChanges();

      expect(addTemporaryMapItemSpy).toHaveBeenCalledWith(map, mapLayer);
    });

    it('should remove a temporary map item when hover ends', () => {
      const removeTemporaryMapItemSpy = vi.spyOn(component, 'removeTemporaryMapItem');

      const mapItem: MapDataItemMapComponent = fixture.debugElement.query(By.directive(MapDataItemMapComponent))?.componentInstance;

      expect(mapItem).toBeDefined();

      mapItem.hoverEndEvent.emit(mapLayer);

      fixture.detectChanges();

      expect(removeTemporaryMapItemSpy).toHaveBeenCalledWith(map, mapLayer);
    });
  });

  describe('trackBy functions', () => {
    it('should track topics by title', () => {
      expect(component.trackByTopicTitle(0, topic)).toBe(topic.title);
    });

    it('should track maps by id', () => {
      expect(component.trackByMapId(0, map)).toBe(map.id);
    });
  });

  describe('destroy', () => {
    it('should clear the catalogue filter when destroyed', () => {
      fixture.destroy();

      expect(storeDispatchSpy).toHaveBeenCalledWith(LayerCatalogActions.clearFilterString());
    });
  });
});
