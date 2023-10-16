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
import {DataDownloadProductEffects} from './data-download-product.effects';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';

describe('DataDownloadProductEffects', () => {
  const productsMock: Products = {
    timestampDateString: '2023-10-09T11:50:02',
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

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadProductEffects;
  let geoshopApiService: GeoshopApiService;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    errorHandlerMock = jasmine.createSpyObj<ErrorHandler>(['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        DataDownloadProductEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: ErrorHandler, useValue: errorHandlerMock},
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadProductEffects);
    geoshopApiService = TestBed.inject(GeoshopApiService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', (done: DoneFn) => {
      const expectedProducts = productsMock;
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(of(expectedProducts));

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadProductActions.setProducts({products: expectedProducts}));
        done();
      });
    });

    it('dispatches DataDownloadActions.setProductsError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('My cabbages!!!');
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(throwError(() => expectedError));

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadProductActions.setProductsError({error: expectedError}));
        done();
      });
    });

    it('dispatches nothing if the products are already in the store', fakeAsync(async () => {
      const expectedProducts = productsMock;
      store.overrideSelector(selectProducts, expectedProducts);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'loadProducts').and.returnValue(
        of({
          timestampDateString: 'nope',
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

      actions$ = of(DataDownloadProductActions.loadProducts());
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

      actions$ = of(DataDownloadProductActions.setProductsError({error: expectedOriginalError}));
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
