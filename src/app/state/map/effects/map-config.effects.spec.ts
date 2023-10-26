import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {MapService} from '../../../map/interfaces/map.service';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapConfigEffects} from './map-config.effects';
import {ZoomType} from '../../../shared/types/zoom.type';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {UrlActions} from '../../app/actions/url.actions';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';

describe('MapConfigEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: MapConfigEffects;
  let mapService: MapService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        MapConfigEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
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
});
