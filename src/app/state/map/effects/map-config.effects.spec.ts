import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Observable, of} from 'rxjs';
import {MapService} from '../../../map/interfaces/map.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {ZoomType} from '../../../shared/types/zoom.type';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {UrlActions} from '../../app/actions/url.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {selectRotation} from '../reducers/map-config.reducer';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';
import {MapConfigEffects} from './map-config.effects';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {InitialMapExtentService} from '../../../map/services/initial-map-extent.service';
import {SearchActions} from '../../app/actions/search.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MAP_SERVICE} from '../../../app.tokens';

describe('MapConfigEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: MapConfigEffects;
  let mapService: MapService;
  let initialMapExtentServiceMock: InitialMapExtentService;
  let mapDrawingService: MapDrawingService;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MapConfigEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(MapConfigEffects);
    initialMapExtentServiceMock = TestBed.inject(InitialMapExtentService);
    vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockImplementation(vi.fn());
    mapService = TestBed.inject(MAP_SERVICE);
    store = TestBed.inject(MockStore);
    mapDrawingService = TestBed.inject(MapDrawingService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('setScaleOnMap$', () => {
    it('sets the scale using the map service, no further action dispatch', () => {
      const expectedScale = 1337;
      const mapServiceSpy = vi.spyOn(mapService, 'setScale');

      const expectedAction = MapConfigActions.setScale({scale: expectedScale});
      actions$ = of(expectedAction);
      effects.setScaleOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith(expectedScale);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('resetExtentOnMap$', () => {
    it('resets the extent using the map service, no further action dispatch', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'resetExtent');

      const expectedAction = MapConfigActions.resetExtent();
      actions$ = of(expectedAction);
      effects.resetExtentOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('changeZoomOnMap$', () => {
    it('changes zoom using the map service, no further action dispatch', () => {
      const expectedZoomType: ZoomType = 'zoomIn';
      const mapServiceSpy = vi.spyOn(mapService, 'handleZoom');

      const expectedAction = MapConfigActions.changeZoom({zoomType: expectedZoomType});
      actions$ = of(expectedAction);
      effects.changeZoomOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith(expectedZoomType);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('setCenterOnMapAndDrawHighlight$', () => {
    it('sets the map center using the map service and draws point highlight, no further action dispatch', () => {
      const expectedCenter: PointWithSrs = {srs: 2056, type: 'Point', coordinates: [123, 456]};
      const mapServiceSpy = vi.spyOn(mapService, 'setMapCenter');
      const mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'drawSearchResultHighlight');

      const expectedAction = MapConfigActions.setMapCenterAndDrawHighlight({center: expectedCenter});
      actions$ = of(expectedAction);
      effects.setMapCenterAndDrawHighlight$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith(expectedCenter);
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledWith(expectedCenter);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('updateMapPageQueryParams$', () => {
    it('dispatches UrlActions.setMapPageParams() if either the center, scale, extent or basemap is changed', () => {
      const expectedParams = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      store.overrideSelector(selectMapConfigParams, expectedParams);

      actions$ = of(MapConfigActions.setMapExtent({x: expectedParams.x, y: expectedParams.y, scale: expectedParams.scale}));
      effects.updateMapPageQueryParams$.subscribe((action) => {
        expect(action).toEqual(UrlActions.setMapPageParams({params: expectedParams}));
      });
    });
  });

  describe('updateMapRotation$', () => {
    it('dispatches MapConfigActions.setRotation() if the rotation is changed', () => {
      const expectedRotation = 42;
      store.overrideSelector(selectRotation, expectedRotation);

      actions$ = of(MapConfigActions.handleMapRotation({rotation: expectedRotation}));
      effects.updateMapRotation$.subscribe((action) => {
        expect(action).toEqual(MapConfigActions.setRotation({rotation: expectedRotation}));
      });
    });
  });

  describe('setBaseMapAndInitialMaps$', () => {
    it('dispatches MapConfigActions.setInitialMapConfig()', () => {
      actions$ = of(
        SearchActions.initializeSearchFromUrlParameters({
          initialMaps: ['one', 'two'],
          basemapId: 'base',
          searchTerm: 'search',
          searchIndex: 'index',
        }),
      );
      vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockReturnValue({x: 1, y: 2, scale: 3});
      effects.setBaseMapAndInitialMaps$.subscribe((action) => {
        expect(action).toEqual(
          MapConfigActions.setInitialMapConfig({initialMaps: ['one', 'two'], basemapId: 'base', x: 1, y: 2, scale: 3}),
        );
      });
    });
  });
});
