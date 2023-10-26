import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ErrorHandler} from '@angular/core';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapService} from '../../../map/interfaces/map.service';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapConfigEffects} from './map-config.effects';
import {ZoomType} from '../../../shared/types/zoom.type';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {routerNavigatedAction} from '@ngrx/router-store';
import {ActivatedRouteSnapshot, NavigationEnd, Params, Router} from '@angular/router';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../../app/selectors/router.selector';
import {selectMainPage} from '../../app/reducers/url.reducer';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';

describe('MapConfigEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: MapConfigEffects;
  let mapService: MapService;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        MapConfigEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: ErrorHandler, useValue: errorHandlerMock},
        {provide: MAP_SERVICE, useClass: MapServiceStub},
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

  describe('getInitialMapConfigFromUrl$', () => {
    it('dispatches MapConfigActions.setInitialMapConfig() if routerNavigatedAction is triggered', (done: DoneFn) => {
      const expectedParams = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').and.returnValue(expectedParams.basemap);

      actions$ = of(
        routerNavigatedAction({
          payload: {
            routerState: {url: '', root: {queryParams: expectedParams as Params} as ActivatedRouteSnapshot},
            event: {} as NavigationEnd,
          },
        }),
      );
      effects.getInitialMapConfigFromUrl$.subscribe((action) => {
        expect(action).toEqual(
          MapConfigActions.setInitialMapConfig({
            scale: expectedParams.scale,
            initialMaps: expectedParams.initialMapIds.split(','),
            x: expectedParams.x,
            y: expectedParams.y,
            basemapId: expectedParams.basemap,
          }),
        );
        done();
      });
    });
  });

  describe('removeTemporaryParametersFromUrl$', () => {
    it('removes all temporary URL parameters, no further action dispatch', (done: DoneFn) => {
      const expectedParams = {x: 1, y: 2, initialMapIds: null};
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();
      const mockParams = {x: 1, y: 2, initialMapIds: 'one,two'} as Params;
      store.overrideSelector(selectQueryParams, mockParams);

      actions$ = of(
        MapConfigActions.setInitialMapConfig({
          x: 1,
          y: 2,
          initialMaps: ['one', 'two'],
          scale: 3,
          basemapId: 'test',
        }),
      );
      effects.removeTemporaryParametersFromUrl$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith([], jasmine.objectContaining({queryParams: expectedParams}));
        done();
      });
    });
  });

  describe('updateQueryParams$', () => {
    it('updates the query parameter, no further action dispatch', (done: DoneFn) => {
      const expectedScale = 5;
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();
      store.overrideSelector(selectMainPage, MainPage.Maps);
      store.overrideSelector(selectMapConfigParams, {x: 1, y: 2, scale: expectedScale, basemap: 'test'});

      actions$ = of(MapConfigActions.setScale({scale: expectedScale}));
      effects.updateQueryParams$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith(
          [],
          jasmine.objectContaining({queryParams: {x: 1, y: 2, scale: expectedScale, basemap: 'test'}}),
        );
        done();
      });
    });
  });
});
