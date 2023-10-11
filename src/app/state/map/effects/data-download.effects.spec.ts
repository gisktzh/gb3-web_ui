import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {catchError} from 'rxjs/operators';
import {ErrorHandler} from '@angular/core';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {DataDownloadEffects} from './data-download.effects';
import {DataDownloadActions} from '../actions/data-download.actions';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {selectProducts} from '../reducers/data-download.reducer';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';

describe('DataDownloadEffects', () => {
  const productsMock: Products = {
    timestamp: '2023-10-09T11:50:02',
    formats: [
      {
        id: 1,
        name: 'Water (.nas)',
      },
      {
        id: 2,
        name: 'Earth (.erd)',
      },
      {
        id: 3,
        name: 'Fire (.hot)',
      },
      {
        id: 4,
        name: 'Air (.air)',
      },
    ],
    products: [
      {
        id: 112,
        name: 'Aang',
        description: 'Avatar',
        type: 'Vektor',
        formats: [1, 2, 3, 4],
      },
      {
        id: 14,
        name: 'Katara',
        description: 'Waterbender',
        type: 'Raster',
        formats: [1],
      },
    ],
    municipalities: [
      {
        id: '0001',
        name: 'Kyoshi Island',
      },
      {
        id: '0002',
        name: 'Omashu',
      },
      {
        id: '0003',
        name: 'Ba Sing Se',
      },
      {
        id: '0004',
        name: 'Southern Air Temple',
      },
      {
        id: '0005',
        name: 'Northern Water Tribe',
      },
    ],
  };

  const selectionMock: DataDownloadSelection = {
    type: 'select-polygon',
    drawingRepresentation: {
      id: 'id',
      type: 'Feature',
      source: InternalDrawingLayer.Selection,
      properties: {},
      geometry: {
        type: 'Polygon',
        srs: 2056,
        coordinates: [
          [
            [9, -23],
            [9, -17],
            [11, -17],
            [11, -23],
          ],
        ],
      },
    },
  };

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadEffects;
  let geoshopApiService: GeoshopApiService;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        DataDownloadEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: ErrorHandler, useValue: errorHandlerMock},
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadEffects);
    geoshopApiService = TestBed.inject(GeoshopApiService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('openDataDownloadDrawerAfterCompletingSelection$', () => {
    it('zooms to the geometry extend using the map service and dispatches MapUiActions.showMapSideDrawerContent()', (done: DoneFn) => {
      const expectedSelection = selectionMock;
      const configService = TestBed.inject(ConfigService);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = spyOn(mapService, 'zoomToExtent').and.callThrough();

      actions$ = of(DataDownloadActions.setSelection({selection: expectedSelection}));
      effects.openDataDownloadDrawerAfterCompletingSelection$.subscribe((action) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(
          expectedSelection.drawingRepresentation.geometry,
          configService.mapAnimationConfig.zoom.expandFactor,
          configService.mapAnimationConfig.zoom.duration,
        );
        expect(action).toEqual(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'}));
        done();
      });
    });
  });

  describe('deactivateToolAfterClearingSelection$', () => {
    it('dispatches ToolActions.deactivateTool()', (done: DoneFn) => {
      actions$ = of(DataDownloadActions.clearSelection());
      effects.deactivateToolAfterClearingSelection$.subscribe((action) => {
        expect(action).toEqual(ToolActions.deactivateTool());
        done();
      });
    });
  });

  describe('clearSelectionAfterClosingDataDownloadDrawer$', () => {
    it('dispatches DataDownloadActions.clearSelection()', (done: DoneFn) => {
      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.clearSelectionAfterClosingDataDownloadDrawer$.subscribe((action) => {
        expect(action).toEqual(DataDownloadActions.clearSelection());
        done();
      });
    });
  });

  describe('clearGeometryFromMap$', () => {
    it('removes the selection graphics using the map service, no further action dispatch', (done: DoneFn) => {
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'clearDataDownloadSelection').and.callThrough();

      const expectedAction = DataDownloadActions.clearSelection();
      actions$ = of(expectedAction);
      effects.clearGeometryFromMap$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', (done: DoneFn) => {
      const expectedProducts = productsMock;
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(of(expectedProducts));

      actions$ = of(DataDownloadActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadActions.setProducts({products: expectedProducts}));
        done();
      });
    });

    it('dispatches DataDownloadActions.setProductsError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('My cabbages!!!');
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(throwError(() => expectedError));

      actions$ = of(DataDownloadActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadActions.setProductsError({error: expectedError}));
        done();
      });
    });

    it('dispatches nothing if the products are already in the store', fakeAsync(async () => {
      const expectedProducts = productsMock;
      store.overrideSelector(selectProducts, expectedProducts);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(
        of({
          timestamp: 'nope',
          formats: [
            {
              id: 3,
              name: 'Only Fire (.hot)',
            },
          ],
          products: [
            {
              id: 16,
              name: 'Zuko',
              description: 'Prince',
              type: 'Vektor',
              formats: [3],
            },
          ],
          municipalities: [
            {
              id: '0006',
              name: 'Fire Nation Capital',
            },
          ],
        }),
      );

      actions$ = of(DataDownloadActions.loadProducts());
      effects.loadProducts$.subscribe();
      tick();

      expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(0);
      store.select(selectProducts).subscribe((capabilities) => {
        expect(capabilities).toEqual(expectedProducts);
      });
      tick();
    }));
  });

  describe('throwProductsError$', () => {
    it('throws a ProdcutsCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new Error('My cabbages!!!');

      actions$ = of(DataDownloadActions.setProductsError({error: expectedOriginalError}));
      effects.throwProductsError$
        .pipe(
          catchError((error) => {
            const expectedError = new ProductsCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
