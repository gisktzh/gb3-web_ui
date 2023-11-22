import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {catchError} from 'rxjs/operators';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {DataDownloadProductEffects} from './data-download-product.effects';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {Municipality, Product, ProductsList} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopProductsService} from '../../../shared/services/apis/gb3/gb3-geoshop-products.service';
import {MapUiActions} from '../actions/map-ui.actions';

describe('DataDownloadProductEffects', () => {
  const productsMock: Product[] = [
    {
      id: '112',
      ogd: true,
      themes: ['Elements', 'Bender'],
      gisZHNr: 1337,
      keywords: ['Avatar', 'Master of four elements', 'Airbender'],
      nonOgdProductUrl: undefined,
      geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
      name: 'Aang',
      formats: [
        {
          id: 1,
          description: 'Water (.nas)',
        },
        {
          id: 2,
          description: 'Earth (.erd)',
        },
        {
          id: 3,
          description: 'Fire (.hot)',
        },
        {
          id: 4,
          description: 'Air (.air)',
        },
      ],
    },
    {
      id: '14',
      ogd: false,
      themes: ['Elements', 'Bender'],
      gisZHNr: 1337,
      keywords: ['Waterbender'],
      nonOgdProductUrl: 'www.example.com',
      geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
      name: 'Katara',
      formats: [
        {
          id: 1,
          description: 'Water (.nas)',
        },
      ],
    },
  ];

  const productsListMock: ProductsList = {
    timestamp: '01.01.1970-13:37',
    products: productsMock,
  };

  // TODO GB3-651: Use on later unit tests or remove
  const municipalitiesMock: Municipality[] = [
    {
      bfsNo: 1,
      name: 'Kyoshi Island',
    },
    {
      bfsNo: 2,
      name: 'Omashu',
    },
    {
      bfsNo: 3,
      name: 'Ba Sing Se',
    },
    {
      bfsNo: 4,
      name: 'Southern Air Temple',
    },
    {
      bfsNo: 5,
      name: 'Northern Water Tribe',
    },
  ];

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadProductEffects;
  let geoshopProductsService: Gb3GeoshopProductsService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        DataDownloadProductEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadProductEffects);
    geoshopProductsService = TestBed.inject(Gb3GeoshopProductsService);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', (done: DoneFn) => {
      const expectedProducts = productsListMock.products;
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProductList').and.returnValue(of(productsListMock));

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadProductActions.setProducts({products: expectedProducts}));
        done();
      });
    });

    it('dispatches DataDownloadActions.setProductsError() with the error on failure', (done: DoneFn) => {
      const expectedError = new Error('My cabbages!!!');
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProductList').and.returnValue(throwError(() => expectedError));

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(DataDownloadProductActions.setProductsError({error: expectedError}));
        done();
      });
    });

    it('dispatches nothing if the products are already in the store', fakeAsync(async () => {
      const expectedProducts = productsMock;
      store.overrideSelector(selectProducts, expectedProducts);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProductList').and.returnValue(
        of({
          timestamp: 'nope',
          products: [
            {
              id: '16',
              ogd: false,
              themes: ['Elements', 'Bender', 'Honor'],
              gisZHNr: 1337,
              keywords: ['Firebender', 'Prince'],
              nonOgdProductUrl: 'www.example.com',
              geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
              name: 'Zuko',
              formats: [
                {
                  id: 3,
                  description: 'Only Fire (.hot)',
                },
              ],
            },
          ],
        }),
      );

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe();
      tick();

      expect(geoshopProductsServiceSpy).not.toHaveBeenCalled();
      store.select(selectProducts).subscribe((capabilities) => {
        expect(capabilities).toEqual(expectedProducts);
      });
      tick();
    }));
  });

  describe('throwProductsError$', () => {
    it('throws a ProductsCouldNotBeLoaded error', (done: DoneFn) => {
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

  describe('resetFiltersAndTermAfterClosingSideDrawer$', () => {
    it('dispatches DataDownloadProductActions.resetFiltersAndTerm() after closing the side drawer', (done: DoneFn) => {
      const expected = DataDownloadProductActions.resetFiltersAndTerm();

      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.resetFiltersAndTermAfterClosingSideDrawer$.subscribe((action) => {
        expect(action).toEqual(expected);
        done();
      });
    });
  });
});
