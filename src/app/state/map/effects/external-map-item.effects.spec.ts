import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_LOADER_SERVICE} from '../../../app.module';
import {createExternalKmlMapItemMock, createExternalWmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {MapServiceType} from '../../../map/types/map-service.type';
import {UuidUtils} from '../../../shared/utils/uuid.utils';
import {ExternalMapItemEffects} from './external-map-item.effects';
import {MapLoaderService} from '../../../map/interfaces/map-loader.service';
import {MapLoaderServiceMock} from '../../../testing/map-testing/map-loader.service.mock';
import {MapImportActions} from '../actions/map-import.actions';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {ExternalServiceCouldNotBeLoaded} from '../../../shared/errors/map-import.errors';
import {catchError} from 'rxjs/operators';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('ExternalMapItemEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: ExternalMapItemEffects;
  let mapLoaderService: MapLoaderService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ExternalMapItemEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_LOADER_SERVICE, useClass: MapLoaderServiceMock},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(ExternalMapItemEffects);
    store = TestBed.inject(MockStore);
    mapLoaderService = TestBed.inject(MAP_LOADER_SERVICE);
    spyOn(UuidUtils, 'createUuid').and.returnValue('not-a-real-uuid');
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadExternalMapItem$', () => {
    it('dispatches ExternalMapItemActions.setItem() with the service response on success', (done: DoneFn) => {
      const url = 'test-url';
      const serviceType: MapServiceType = 'wms';
      const externalMapItem = createExternalWmsMapItemMock(url, 'test', []);
      const mapLoaderServiceSpy = spyOn(mapLoaderService, 'loadExternalService').and.returnValue(of(externalMapItem));

      const expectedAction = ExternalMapItemActions.setItem({externalMapItem});

      actions$ = of(ExternalMapItemActions.loadItem({url, serviceType}));
      effects.loadExternalMapItem$.subscribe((action) => {
        expect(mapLoaderServiceSpy).toHaveBeenCalledOnceWith(url, serviceType);
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches ExternalMapItemActions.setItemError() with the error on failure', (done: DoneFn) => {
      const url = 'test-url';
      const serviceType: MapServiceType = 'wms';
      const error = new Error('oh no! anyway...');
      const mapLoaderServiceSpy = spyOn(mapLoaderService, 'loadExternalService').and.returnValue(throwError(() => error));

      const expectedAction = ExternalMapItemActions.setItemError({error});

      actions$ = of(ExternalMapItemActions.loadItem({url, serviceType}));
      effects.loadExternalMapItem$.subscribe((action) => {
        expect(mapLoaderServiceSpy).toHaveBeenCalledOnceWith(url, serviceType);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setLayersAndImageFormatFromExternalMapItem$', () => {
    it('dispatches MapImportActions.setLayersAndImageFormat() after setting an external WMS map item', (done: DoneFn) => {
      const layers: ExternalWmsLayer[] = [
        {type: 'wms', id: 1, name: 'wms-layer-name-one', title: 'wms-layer-title-one', visible: true},
        {type: 'wms', id: 2, name: 'wms-layer-name-two', title: 'wms-layer-title-two', visible: false},
      ];
      const imageFormat = 'image/png';
      const externalMapItem = createExternalWmsMapItemMock('url', 'test', layers, imageFormat);

      const expectedAction = MapImportActions.setLayersAndImageFormat({
        layers,
        imageFormat,
      });

      actions$ = of(ExternalMapItemActions.setItem({externalMapItem}));
      effects.setLayersAndImageFormatFromExternalMapItem$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches MapImportActions.setLayersAndImageFormat() after setting an external KML map item', (done: DoneFn) => {
      const layers: ExternalKmlLayer[] = [
        {type: 'kml', id: 1, title: 'kml-layer-title-one', visible: true},
        {type: 'kml', id: 2, title: 'kml-layer-title-two', visible: false},
      ];
      const externalMapItem = createExternalKmlMapItemMock('url', 'test', layers);

      const expectedAction = MapImportActions.setLayersAndImageFormat({
        layers,
      });

      actions$ = of(ExternalMapItemActions.setItem({externalMapItem}));
      effects.setLayersAndImageFormatFromExternalMapItem$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('throwExternalMapItemError$', () => {
    it('throws a ExternalServiceCouldNotBeLoaded error after setting an item error', (done: DoneFn) => {
      const originalError = new Error('oh no! anyway...');

      const expectedError = new ExternalServiceCouldNotBeLoaded(originalError);

      actions$ = of(ExternalMapItemActions.setItemError({error: originalError}));
      effects.throwExternalMapItemError$
        .pipe(
          catchError((error) => {
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
