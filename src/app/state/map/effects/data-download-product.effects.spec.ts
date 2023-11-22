import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
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
import {ProductsCouldNotBeLoaded, RelevantProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {Product, ProductsList} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopProductsService} from '../../../shared/services/apis/gb3/gb3-geoshop-products.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createGb2WmsMapItemMock, createUuidFromId} from '../../../testing/map-testing/active-map-item-test.utils';
import {DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';

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

  describe('loadAllProducts$', () => {
    it('dispatches DataDownloadProductActions.loadProducts() after loading products and relevant products', (done: DoneFn) => {
      const expectedAction = DataDownloadProductActions.loadProducts();

      actions$ = of(DataDownloadProductActions.loadProductsAndRelevantProducts());
      effects.loadAllProducts$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('loadAllRelevantProducts$', () => {
    it('dispatches DataDownloadProductActions.loadRelevantProductsIds() after loading products and relevant products', (done: DoneFn) => {
      const expectedAction = DataDownloadProductActions.loadRelevantProductsIds();

      actions$ = of(DataDownloadProductActions.loadProductsAndRelevantProducts());
      effects.loadAllRelevantProducts$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', (done: DoneFn) => {
      const products = productsListMock.products;
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProductList').and.returnValue(of(productsListMock));

      const expectedAction = DataDownloadProductActions.setProducts({products});

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadActions.setProductsError() with the error on failure', (done: DoneFn) => {
      const error = new Error('My cabbages!!!');
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProductList').and.returnValue(throwError(() => error));

      const expectedAction = DataDownloadProductActions.setProductsError({error});

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith();
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the products are already in the store', fakeAsync(async () => {
      const products = productsMock;
      store.overrideSelector(selectProducts, products);
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
      flush();

      expect(geoshopProductsServiceSpy).not.toHaveBeenCalled();
      store.select(selectProducts).subscribe((stateProducts) => {
        expect(stateProducts).toEqual(products);
      });
      flush();
    }));
  });

  describe('throwProductsError$', () => {
    it('throws a ProductsCouldNotBeLoaded error after setting a products error', (done: DoneFn) => {
      const originalError = new Error('My cabbages!!!');

      const expectedError = new ProductsCouldNotBeLoaded(originalError);

      actions$ = of(DataDownloadProductActions.setProductsError({error: originalError}));
      effects.throwProductsError$
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

  describe('loadRelevantProductsIds$', () => {
    const activeMapItems: ActiveMapItem[] = [
      createGb2WmsMapItemMock('id1'),
      createGb2WmsMapItemMock('id2'),
      createGb2WmsMapItemMock('id3'),
    ];

    it('dispatches DataDownloadProductActions.loadRelevantProductsIds() with the service response on success', (done: DoneFn) => {
      store.overrideSelector(selectItems, activeMapItems);
      const productIds = ['prodId1'];
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadRelevanteProducts').and.returnValue(of(productIds));

      const expectedGuids = activeMapItems.map((item) => createUuidFromId(item.id));
      const expectedAction = DataDownloadProductActions.setRelevantProductsIds({productIds});

      actions$ = of(DataDownloadProductActions.loadRelevantProductsIds());
      effects.loadRelevantProductsIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(expectedGuids);
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadProductActions.setRelevantProductsIdsError() with the error on failure', (done: DoneFn) => {
      store.overrideSelector(selectItems, activeMapItems);
      const error = new Error('My cabbages!!!');
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadRelevanteProducts').and.returnValue(throwError(() => error));

      const expectedGuids = activeMapItems.map((item) => createUuidFromId(item.id));
      const expectedAction = DataDownloadProductActions.setRelevantProductsIdsError({error});

      actions$ = of(DataDownloadProductActions.loadRelevantProductsIds());
      effects.loadRelevantProductsIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(expectedGuids);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('throwRelevantProductsIdsError$', () => {
    it('throws a RelevantProductsCouldNotBeLoaded error after setting a relevant products ids error', (done: DoneFn) => {
      const originalError = new Error('My cabbages!!!');

      const expectedError = new RelevantProductsCouldNotBeLoaded(originalError);

      actions$ = of(DataDownloadProductActions.setRelevantProductsIdsError({error: originalError}));
      effects.throwRelevantProductsIdsError$
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

  describe('initializeDataDownloadFilters$', () => {
    it('dispatches DataDownloadProductActions.setFilters() after setting products', (done: DoneFn) => {
      const products = productsMock;
      const dataDownloadFilters: DataDownloadFilter[] = [{category: 'theme', filterValues: [], label: 'label'}];
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'extractProductFilterValues').and.returnValue(dataDownloadFilters);

      const expectedAction = DataDownloadProductActions.setFilters({dataDownloadFilters});

      actions$ = of(DataDownloadProductActions.setProducts({products}));
      effects.initializeDataDownloadFilters$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(products);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
