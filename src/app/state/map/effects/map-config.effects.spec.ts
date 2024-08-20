import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Observable, of} from 'rxjs';
import {MAP_SERVICE} from '../../../app.module';
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

describe('MapConfigEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: MapConfigEffects;
  let mapService: MapService;
  let initialMapExtentServiceMock: jasmine.SpyObj<InitialMapExtentService>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    initialMapExtentServiceMock = jasmine.createSpyObj<InitialMapExtentService>(['calculateInitialExtent']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MapConfigEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        {provide: InitialMapExtentService, useValue: initialMapExtentServiceMock},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(MapConfigEffects);
    mapService = TestBed.inject(MAP_SERVICE);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('setScaleOnMap$', () => {
    it('sets the scale using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedScale = 1337;
      const mapServiceSpy = spyOn(mapService, 'setScale').and.callThrough();

      const expectedAction = MapConfigActions.setScale({scale: expectedScale});
      actions$ = of(expectedAction);
      effects.setScaleOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedScale);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('resetExtentOnMap$', () => {
    it('resets the extent using the map service, no further action dispatch', (done: DoneFn) => {
      const mapServiceSpy = spyOn(mapService, 'resetExtent').and.callThrough();

      const expectedAction = MapConfigActions.resetExtent();
      actions$ = of(expectedAction);
      effects.resetExtentOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('changeZoomOnMap$', () => {
    it('changes zoom using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedZoomType: ZoomType = 'zoomIn';
      const mapServiceSpy = spyOn(mapService, 'handleZoom').and.callThrough();

      const expectedAction = MapConfigActions.changeZoom({zoomType: expectedZoomType});
      actions$ = of(expectedAction);
      effects.changeZoomOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedZoomType);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setCenterOnMap$', () => {
    it('sets the map center using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedCenter: PointWithSrs = {srs: 2056, type: 'Point', coordinates: [123, 456]};
      const mapServiceSpy = spyOn(mapService, 'setMapCenter').and.callThrough();

      const expectedAction = MapConfigActions.setMapCenter({center: expectedCenter});
      actions$ = of(expectedAction);
      effects.setCenterOnMap$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(expectedCenter);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('updateMapPageQueryParams$', () => {
    it('dispatches UrlActions.setMapPageParams() if either the center, scale, extent or basemap is changed', (done: DoneFn) => {
      const expectedParams = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      store.overrideSelector(selectMapConfigParams, expectedParams);

      actions$ = of(MapConfigActions.setMapExtent({x: expectedParams.x, y: expectedParams.y, scale: expectedParams.scale}));
      effects.updateMapPageQueryParams$.subscribe((action) => {
        expect(action).toEqual(UrlActions.setMapPageParams({params: expectedParams}));
        done();
      });
    });
  });

  describe('updateMapRotation$', () => {
    it('dispatches MapConfigActions.setRotation() if the rotation is changed', (done: DoneFn) => {
      const expectedRotation = 42;
      store.overrideSelector(selectRotation, expectedRotation);

      actions$ = of(MapConfigActions.handleMapRotation({rotation: expectedRotation}));
      effects.updateMapRotation$.subscribe((action) => {
        expect(action).toEqual(MapConfigActions.setRotation({rotation: expectedRotation}));
        done();
      });
    });
  });

  describe('setBaseMapAndInitialMaps$', () => {
    it('dispatches MapConfigActions.setInitialMapConfig()', (done: DoneFn) => {
      actions$ = of(
        SearchActions.initializeSearchFromUrlParameters({
          initialMaps: ['one', 'two'],
          basemapId: 'base',
          searchTerm: 'search',
          searchIndex: 'index',
        }),
      );
      initialMapExtentServiceMock.calculateInitialExtent.and.returnValue({x: 1, y: 2, scale: 3});
      effects.setBaseMapAndInitialMaps$.subscribe((action) => {
        expect(action).toEqual(
          MapConfigActions.setInitialMapConfig({initialMaps: ['one', 'two'], basemapId: 'base', x: 1, y: 2, scale: 3}),
        );
        done();
      });
    });
  });
});
