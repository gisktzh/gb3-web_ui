import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {ActiveMapItemEffects} from './active-map-item.effects';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {MapService} from '../../../map/interfaces/map.service';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {ToolActions} from '../actions/tool.actions';
import {selectItems, selectTemporaryMapItems} from '../selectors/active-map-items.selector';
import {selectActiveTool} from '../reducers/tool.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MapUiActions} from '../actions/map-ui.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {TimeExtent} from '../../../map/interfaces/time-extent.interface';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {
  FilterConfiguration,
  Map,
  MapLayer,
  TimeSliderConfiguration,
  TimeSliderLayerSource,
} from '../../../shared/interfaces/topic.interface';
import {MapConfigActions} from '../actions/map-config.actions';
import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {MapConstants} from '../../../shared/constants/map.constants';
import {selectIsMapServiceInitialized} from '../reducers/map-config.reducer';
import {DrawingActions} from '../actions/drawing.actions';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {SearchActions} from '../../app/actions/search.actions';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {MAP_SERVICE} from '../../../app.tokens';

describe('ActiveMapItemEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ActiveMapItemEffects;
  let gb3TopicsService: Gb3TopicsService;
  let mapService: MapService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ActiveMapItemEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(ActiveMapItemEffects);
    gb3TopicsService = TestBed.inject(Gb3TopicsService);
    mapService = TestBed.inject(MAP_SERVICE);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('addMapItem$', () => {
    it('adds the given map item using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const expectedPosition = 1337;
      const activeMapItemSpy = spyOn(expectedActiveMapItem, 'addToMap').and.callThrough();

      const expectedAction = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedActiveMapItem, position: expectedPosition});
      actions$ = of(expectedAction);
      effects.addMapItem$.subscribe((action) => {
        expect(activeMapItemSpy).toHaveBeenCalledOnceWith(mapService, expectedPosition);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('removeMapItem$', () => {
    it('removes the given map item using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedId = 'mapMock';
      const activeMapItem = createGb2WmsMapItemMock(expectedId);
      const mapServiceSpy = spyOn(mapService, 'removeMapItem').and.callThrough();

      const expectedAction = ActiveMapItemActions.removeActiveMapItem({activeMapItem});
      actions$ = of(expectedAction);
      effects.removeMapItem$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedId);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('removeTemporaryActiveMapItem$', () => {
    it('dispatches ActiveMapItemActions.removeActiveMapItem if the active map item is not yet added to the map', (done: DoneFn) => {
      const expectedId = 'mapMock';
      const activeMapItem = createGb2WmsMapItemMock(expectedId, undefined, undefined, undefined, undefined, true);

      store.overrideSelector(selectItems, []);

      const expectedAction = ActiveMapItemActions.removeActiveMapItem({activeMapItem});
      actions$ = of(ActiveMapItemActions.removeTemporaryActiveMapItem({activeMapItem}));
      effects.removeTemporaryActiveMapItem$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('does not dispatch anything if the item is already added as permanent item', fakeAsync(async () => {
      const expectedId = 'mapMock';
      const temporaryActiveMapItem = createGb2WmsMapItemMock(expectedId, undefined, undefined, undefined, undefined, true);
      const activeMapItem = createGb2WmsMapItemMock(expectedId);

      store.overrideSelector(selectItems, [activeMapItem]);

      let actualAction;
      actions$ = of(ActiveMapItemActions.removeTemporaryActiveMapItem({activeMapItem: temporaryActiveMapItem}));
      effects.removeTemporaryActiveMapItem$.subscribe((action) => (actualAction = action));
      flush();
      expect(actualAction).toBeUndefined();
    }));
  });

  describe('removeAllTemporaryMapItems$', () => {
    [
      {name: 'LayerCatalogActions.setFilterString', action: LayerCatalogActions.setFilterString},
      {name: 'LayerCatalogActions.clearFilterString', action: LayerCatalogActions.clearFilterString},
      {name: 'SearchActions.searchForTerm', action: SearchActions.searchForTerm},
      {name: 'SearchActions.clearSearchTerm', action: SearchActions.clearSearchTerm},
    ].forEach(({name, action}) => {
      it(`reacts on ${name} and removes all temporary map items using the map service and dispatches ActiveMapItemActions.removeAllTemporaryActiveMapItems()`, (done: DoneFn) => {
        const activeMapItem1 = createGb2WmsMapItemMock('temp-1', 0, true, 1.0, 'uuid-1', true);
        const activeMapItem2 = createGb2WmsMapItemMock('temp-2', 0, true, 1.0, 'uuid-2', true);
        store.overrideSelector(selectTemporaryMapItems, [activeMapItem1, activeMapItem2]);
        const mapServiceSpy = spyOn(mapService, 'removeMapItem').and.callThrough();

        const expectedAction = ActiveMapItemActions.removeAllTemporaryActiveMapItems();
        actions$ = of(action);
        effects.removeAllTemporaryMapItems$.subscribe((actualAction) => {
          expect(mapServiceSpy).toHaveBeenCalledTimes(2);
          expect(mapServiceSpy).toHaveBeenCalledWith(activeMapItem1.id);
          expect(mapServiceSpy).toHaveBeenCalledWith(activeMapItem2.id);
          expect(actualAction).toEqual(expectedAction);
          done();
        });
      });
    });
  });

  describe('removeAllMapItems$', () => {
    it('removes all map items using the map service, no further action dispatch', (done: DoneFn) => {
      const mapServiceSpy = spyOn(mapService, 'removeAllMapItems').and.callThrough();

      const expectedAction = ActiveMapItemActions.removeAllActiveMapItems();
      actions$ = of(expectedAction);
      effects.removeAllMapItems$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('cancelToolAfterRemovingAllCorrespondingMapItems$', () => {
    it('dispatches ToolActions.cancelTool() if removeAllActiveMapItems action is executed', (done: DoneFn) => {
      const activeMapItems: ActiveMapItem[] = [
        createDrawingMapItemMock(UserDrawingLayer.Measurements),
        createDrawingMapItemMock(UserDrawingLayer.Drawings),
        createGb2WmsMapItemMock('mapMock'),
      ];
      store.overrideSelector(selectItems, activeMapItems);
      store.overrideSelector(selectActiveTool, 'measure-area');

      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());
      effects.cancelToolAfterRemovingAllCorrespondingMapItems$.subscribe((action) => {
        expect(action).toEqual(ToolActions.cancelTool());
        done();
      });
    });

    it('dispatches ToolActions.cancelTool() if removeActiveMapItem action is executed and there are no more items of that type', (done: DoneFn) => {
      // note that the measurement item is not in the state
      const activeMapItems: ActiveMapItem[] = [createDrawingMapItemMock(UserDrawingLayer.Drawings), createGb2WmsMapItemMock('mapMock')];
      store.overrideSelector(selectItems, activeMapItems);
      store.overrideSelector(selectActiveTool, 'measure-area');

      const measurementActiveMapItem = createDrawingMapItemMock(UserDrawingLayer.Measurements);
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: measurementActiveMapItem}));
      effects.cancelToolAfterRemovingAllCorrespondingMapItems$.subscribe((action) => {
        expect(action).toEqual(ToolActions.cancelTool());
        done();
      });
    });

    it('dispatches nothing if removeActiveMapItem action is executed and there are more items of that type', fakeAsync(async () => {
      const activeMapItems: ActiveMapItem[] = [
        createDrawingMapItemMock(UserDrawingLayer.Measurements),
        createDrawingMapItemMock(UserDrawingLayer.Drawings),
        createGb2WmsMapItemMock('mapMock'),
      ];
      store.overrideSelector(selectItems, activeMapItems);
      store.overrideSelector(selectActiveTool, 'measure-area');

      let actualAction;
      actions$ = of(ActiveMapItemActions.removeActiveMapItem({activeMapItem: activeMapItems[1]}));
      effects.cancelToolAfterRemovingAllCorrespondingMapItems$.subscribe((action) => (actualAction = action));
      flush();

      expect(actualAction).toBeUndefined();
    }));
  });

  describe('hideLegendAfterRemovingAllMapItems$', () => {
    it('dispatches MapUiActions.setLegendOverlayVisibility() if removeAllActiveMapItems action is executed', (done: DoneFn) => {
      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());
      effects.hideLegendAfterRemovingAllMapItems$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setLegendOverlayVisibility({isVisible: false}));
        done();
      });
    });
  });

  describe('hideMapAttributeFilterAfterRemovingAllMapItems$', () => {
    it('dispatches MapUiActions.setAttributeFilterVisibility() if removeAllActiveMapItems action is executed', (done: DoneFn) => {
      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());
      effects.hideMapAttributeFilterAfterRemovingAllMapItems$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.setAttributeFilterVisibility({isVisible: false}));
        done();
      });
    });
  });

  describe('clearFeatureInfoContentAfterRemovingAllMapItems$', () => {
    it('dispatches FeatureInfoActions.clearContent() if removeAllActiveMapItems action is executed', (done: DoneFn) => {
      actions$ = of(ActiveMapItemActions.removeAllActiveMapItems());
      effects.clearFeatureInfoContentAfterRemovingAllMapItems$.subscribe((action) => {
        expect(action).toEqual(FeatureInfoActions.clearContent());
        done();
      });
    });
  });

  describe('moveToTop$', () => {
    it('moves the given map item to the top using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceSpy = spyOn(mapService, 'moveLayerToTop').and.callThrough();

      const expectedAction = ActiveMapItemActions.moveToTop({activeMapItem: expectedActiveMapItem});
      actions$ = of(expectedAction);
      effects.moveToTop$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedActiveMapItem);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('forceFullVisibility$', () => {
    it('dispatches ActiveMapItemActions.moveToTop() and calls the map service twice', (done: DoneFn) => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceOpacitySpy = spyOn(mapService, 'setOpacity').and.callThrough();
      const mapServiceVisibilitySpy = spyOn(mapService, 'setVisibility').and.callThrough();
      const expectedOpacity = 1;
      const expectedVisibility = true;

      actions$ = of(ActiveMapItemActions.forceFullVisibility({activeMapItem: expectedActiveMapItem}));
      effects.forceFullVisibility$.subscribe((action) => {
        expect(mapServiceOpacitySpy).toHaveBeenCalledOnceWith(expectedOpacity, expectedActiveMapItem);
        expect(mapServiceVisibilitySpy).toHaveBeenCalledOnceWith(expectedVisibility, expectedActiveMapItem);
        expect(action).toEqual(ActiveMapItemActions.moveToTop({activeMapItem: expectedActiveMapItem}));
        done();
      });
    });
  });

  describe('setOpacity$', () => {
    it('sets the opacity of the given map item using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedOpacity = 0.1234;
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceSpy = spyOn(mapService, 'setOpacity').and.callThrough();

      const expectedAction = ActiveMapItemActions.setOpacity({opacity: expectedOpacity, activeMapItem: expectedActiveMapItem});
      actions$ = of(expectedAction);
      effects.setOpacity$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedOpacity, expectedActiveMapItem);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setItemVisibility$', () => {
    it('sets the visibility of the given map item using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedVisibility = false;
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceSpy = spyOn(mapService, 'setVisibility').and.callThrough();

      const expectedAction = ActiveMapItemActions.setVisibility({visible: expectedVisibility, activeMapItem: expectedActiveMapItem});
      actions$ = of(expectedAction);
      effects.setItemVisibility$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedVisibility, expectedActiveMapItem);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setSublayerVisibility$', () => {
    it('sets the visibility of the given map item layer using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedVisibility = false;
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock', 1);
      const expectedLayerId = expectedActiveMapItem.settings.layers[0].id;
      const mapServiceSpy = spyOn(mapService, 'setSublayerVisibility').and.callThrough();

      const expectedAction = ActiveMapItemActions.setSublayerVisibility({
        visible: expectedVisibility,
        activeMapItem: expectedActiveMapItem,
        layerId: expectedLayerId,
      });
      actions$ = of(expectedAction);
      effects.setSublayerVisibility$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedVisibility, expectedActiveMapItem, expectedLayerId);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('reorderItem$', () => {
    it('reorders the given map item using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedPreviousPosition = 123;
      const expectedCurrentPosition = 456;
      const mapServiceSpy = spyOn(mapService, 'reorderMapItem').and.callThrough();

      const expectedAction = ActiveMapItemActions.reorderActiveMapItem({
        previousPosition: expectedPreviousPosition,
        currentPosition: expectedCurrentPosition,
      });
      actions$ = of(expectedAction);
      effects.reorderItem$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedPreviousPosition, expectedCurrentPosition);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('reorderSublayer$', () => {
    it('reorders the given map item layer using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedPreviousPosition = 123;
      const expectedCurrentPosition = 456;
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceSpy = spyOn(mapService, 'reorderSublayer').and.callThrough();

      const expectedAction = ActiveMapItemActions.reorderSublayer({
        activeMapItem: expectedActiveMapItem,
        previousPosition: expectedPreviousPosition,
        currentPosition: expectedCurrentPosition,
      });
      actions$ = of(expectedAction);
      effects.reorderSublayer$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedActiveMapItem, expectedPreviousPosition, expectedCurrentPosition);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setTimeSliderExtentOnMap$', () => {
    it('sets the time extent using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedTimeExtent: TimeExtent = {start: new Date(666), end: new Date(1337)};
      const expectedActiveMapItem = createGb2WmsMapItemMock('mapMock');
      const mapServiceSpy = spyOn(mapService, 'setTimeSliderExtent').and.callThrough();

      const expectedAction = ActiveMapItemActions.setTimeSliderExtent({
        activeMapItem: expectedActiveMapItem,
        timeExtent: expectedTimeExtent,
      });
      actions$ = of(expectedAction);
      effects.setTimeSliderExtentOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedTimeExtent, expectedActiveMapItem);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setActiveFilters$', () => {
    const filterConfigurationsMock: FilterConfiguration[] = [
      {
        name: 'Anzeigeoptionen nach Hauptnutzung',
        parameter: 'FILTER_GEBART',
        filterValues: [
          {
            name: 'Wohnen',
            values: ['Gebäude Wohnen'],
            isActive: true,
          },
          {
            name: 'Gewerbe und Verwaltung',
            values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
            isActive: true,
          },
          {
            name: 'Andere',
            values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
            isActive: false,
          },
        ],
      },
    ];

    const mapMock = {id: 'test', title: 'test_title', layers: [], filterConfigurations: filterConfigurationsMock} as Partial<Map>;

    it('transforms the filters using the topics service and then sets it on the active map using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedActiveMapItem = ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock);
      const activeMapItems: ActiveMapItem[] = [
        createDrawingMapItemMock(UserDrawingLayer.Measurements),
        createDrawingMapItemMock(UserDrawingLayer.Drawings),
        createGb2WmsMapItemMock('otherMapItemMock'),
        expectedActiveMapItem,
      ];
      store.overrideSelector(selectItems, activeMapItems);
      const gb3TopicsServiceSpy = spyOn(gb3TopicsService, 'transformFilterConfigurationToParameters').and.callThrough();
      const mapServiceSpy = spyOn(mapService, 'setAttributeFilters').and.callThrough();

      const expectedAction = ActiveMapItemActions.setAttributeFilterValueState({
        isFilterValueActive: true,
        filterValueName: 'irrelevant_for_this_test',
        attributeFilterParameter: 'irrelevant_for_this_test',
        activeMapItem: expectedActiveMapItem,
      });
      actions$ = of(expectedAction);
      effects.setActiveFilters$.subscribe(([action, _]) => {
        expect(gb3TopicsServiceSpy).toHaveBeenCalledOnceWith(filterConfigurationsMock);
        const expectedAttributeFilterParameters = gb3TopicsService.transformFilterConfigurationToParameters(filterConfigurationsMock);
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedAttributeFilterParameters, expectedActiveMapItem);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('addFavourite$', () => {
    it('dispatches DrawingActions.overwriteDrawingLayersWithDrawings() after adding all favourite map items using the map service', (done: DoneFn) => {
      const expectedFavouriteActiveMapItems: ActiveMapItem[] = [
        createGb2WmsMapItemMock('favouriteOne'),
        createGb2WmsMapItemMock('favouriteTwo'),
      ];
      const expectedCenter: PointWithSrs = {
        type: 'Point',
        srs: MapConstants.DEFAULT_SRS,
        coordinates: [1337, 9000.0001],
      };
      const expectedFavouriteBaseConfig: FavouriteBaseConfig = {
        scale: 1_500_000,
        center: {x: expectedCenter.coordinates[0], y: expectedCenter.coordinates[1]},
        basemap: "I have come here to chew bubblegum and kick ass. And I'm all out of bubblegum.",
      };
      const activeMapItemSpies: {spy: jasmine.Spy; expectedPosition: number}[] = expectedFavouriteActiveMapItems.map((item, index) => ({
        spy: spyOn(item, 'addToMap').and.callThrough(),
        expectedPosition: index,
      }));
      const mapServiceRemoveMapItemSpy = spyOn(mapService, 'removeMapItem').and.callThrough();

      actions$ = of(
        ActiveMapItemActions.addFavourite({
          activeMapItems: expectedFavouriteActiveMapItems,
          baseConfig: expectedFavouriteBaseConfig,
          drawingsToAdd: [],
        }),
      );
      effects.addFavourite$.subscribe((action) => {
        activeMapItemSpies.forEach((itemSpy) => {
          expect(itemSpy.spy).toHaveBeenCalledOnceWith(mapService, itemSpy.expectedPosition);
        });
        expect(mapServiceRemoveMapItemSpy).toHaveBeenCalledTimes(expectedFavouriteActiveMapItems.length);
        expectedFavouriteActiveMapItems.forEach((item) => {
          expect(mapServiceRemoveMapItemSpy).toHaveBeenCalledWith(item.id);
        });
        expect(action).toEqual(DrawingActions.overwriteDrawingLayersWithDrawings({layersToOverride: [], drawingsToAdd: []}));
        done();
      });
    });
  });

  describe('updateBasemapForFavourite$', () => {
    it('dispatches MapConfigActions.setBasemap()', (done: DoneFn) => {
      const expectedCenter: PointWithSrs = {
        type: 'Point',
        srs: MapConstants.DEFAULT_SRS,
        coordinates: [1337, 9000.0001],
      };
      const expectedFavouriteBaseConfig: FavouriteBaseConfig = {
        scale: 1_500_000,
        center: {x: expectedCenter.coordinates[0], y: expectedCenter.coordinates[1]},
        basemap: 'favMap',
      };

      actions$ = of(
        ActiveMapItemActions.addFavourite({
          activeMapItems: [],
          baseConfig: expectedFavouriteBaseConfig,
          drawingsToAdd: [],
        }),
      );
      effects.updateBasemapForFavourite$.subscribe((action) => {
        expect(action).toEqual(MapConfigActions.setBasemap({activeBasemapId: expectedFavouriteBaseConfig.basemap}));
        done();
      });
    });
  });

  describe('addInitialMapItems$', () => {
    it('dispatches MapConfigActions.clearInitialMapsConfig() after adding all initial map items using the map service (if it is initialized)', (done: DoneFn) => {
      store.overrideSelector(selectIsMapServiceInitialized, true);
      const expectedInitialActiveMapItems: ActiveMapItem[] = [
        createGb2WmsMapItemMock('initialItemOne'),
        createGb2WmsMapItemMock('initialItemTwo'),
      ];
      const activeMapItemSpies: {spy: jasmine.Spy; expectedPosition: number}[] = expectedInitialActiveMapItems.map((item, index) => ({
        spy: spyOn(item, 'addToMap').and.callThrough(),
        expectedPosition: index,
      }));

      actions$ = of(ActiveMapItemActions.addInitialMapItems({initialMapItems: expectedInitialActiveMapItems}));
      effects.addInitialMapItems$.subscribe((action) => {
        activeMapItemSpies.forEach((itemSpy) => {
          expect(itemSpy.spy).toHaveBeenCalledOnceWith(mapService, itemSpy.expectedPosition);
        });
        expect(action).toEqual(MapConfigActions.clearInitialMapsConfig());
        done();
      });
    });

    it('waits for map service initialization and then adds items and dispatches MapConfigActions.clearInitialMapsConfig()', (done: DoneFn) => {
      const isInitialized$ = new BehaviorSubject<boolean>(false);
      store.overrideSelector(selectIsMapServiceInitialized, false);
      store.select = jasmine.createSpy().and.callFake((selector: unknown) => {
        if (selector === selectIsMapServiceInitialized) {
          return isInitialized$;
        }
        return store.pipe();
      });

      const expectedInitialActiveMapItems: ActiveMapItem[] = [
        createGb2WmsMapItemMock('initialItemOne'),
        createGb2WmsMapItemMock('initialItemTwo'),
      ];
      const activeMapItemSpies: {spy: jasmine.Spy; expectedPosition: number}[] = expectedInitialActiveMapItems.map((item, index) => ({
        spy: spyOn(item, 'addToMap').and.callThrough(),
        expectedPosition: index,
      }));

      actions$ = of(ActiveMapItemActions.addInitialMapItems({initialMapItems: expectedInitialActiveMapItems}));
      effects.addInitialMapItems$.subscribe((action) => {
        activeMapItemSpies.forEach((itemSpy) => {
          expect(itemSpy.spy).toHaveBeenCalledOnceWith(mapService, itemSpy.expectedPosition);
        });
        expect(action).toEqual(MapConfigActions.clearInitialMapsConfig());
        done();
      });

      // Simulate map service becoming initialized after a delay
      isInitialized$.next(true);
    });
  });

  describe('setTimeSliderExtent$', () => {
    it('dispatches nothing if item does not exist', fakeAsync(() => {
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };
      const activeMapItem = createGb2WmsMapItemMock('id');
      store.overrideSelector(selectItems, []);

      let newAction;
      actions$ = of(ActiveMapItemActions.setTimeSliderExtent({timeExtent, activeMapItem}));
      effects.setTimeSliderExtent$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));

    it('sets the time extent and reevaluates all layer visibilities, dispatches replaceActiveMapItem', (done: DoneFn) => {
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };
      const mapMock: Partial<Map> = {id: 'id'};
      mapMock.layers = [
        {layer: 'layer01', visible: false} as MapLayer,
        {layer: 'layer02', visible: false} as MapLayer,
        {layer: 'layer03', visible: false} as MapLayer,
      ];
      mapMock.timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [
            {layerName: 'layer01', date: '2022-06-30'},
            {layerName: 'layer02', date: '2023-06-30'},
            {layerName: 'layer03', date: '2024-06-30'},
          ],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      mapMock.initialTimeSliderExtent = timeExtent;
      const activeMapItem = ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock);
      store.overrideSelector(selectItems, [activeMapItem]);

      actions$ = of(ActiveMapItemActions.setTimeSliderExtent({timeExtent, activeMapItem}));
      const expectedAction = ActiveMapItemActions.replaceActiveMapItem({modifiedActiveMapItem: activeMapItem});
      effects.setTimeSliderExtent$.subscribe(({modifiedActiveMapItem, type}) => {
        const expectedTimeExtent = timeExtent;
        const expectedLayers: Partial<MapLayer>[] = [
          {layer: 'layer01', visible: false},
          {layer: 'layer02', visible: true},
          {layer: 'layer03', visible: false},
        ];

        expect(type).toEqual(expectedAction.type);
        expect(modifiedActiveMapItem).toBeInstanceOf(Gb2WmsActiveMapItem);
        expect((<Gb2WmsActiveMapItem>modifiedActiveMapItem).settings.timeSliderExtent).toEqual(expectedTimeExtent);
        expect((<Gb2WmsActiveMapItem>modifiedActiveMapItem).settings.layers).toEqual(<MapLayer[]>expectedLayers);

        done();
      });
    });
  });
});
