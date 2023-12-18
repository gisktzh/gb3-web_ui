import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {DataDownloadProductEffects} from './data-download-product.effects';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {ProductsCouldNotBeLoaded, RelevantProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopProductsService} from '../../../shared/services/apis/gb3/gb3-geoshop-products.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';
import {catchError} from 'rxjs/operators';

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
    it('dispatches DataDownloadProductActions.loadRelevantProductIds() after loading products and relevant products', (done: DoneFn) => {
      const expectedAction = DataDownloadProductActions.loadRelevantProductIds();

      actions$ = of(DataDownloadProductActions.loadProductsAndRelevantProducts());
      effects.loadAllRelevantProducts$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', (done: DoneFn) => {
      const products = productsMock;
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProducts').and.returnValue(of(products));

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
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProducts').and.returnValue(throwError(() => error));

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
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadProducts').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => (newAction = action));
      flush();

      expect(geoshopProductsServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
    }));
  });

  describe('throwProductsError$', () => {
    it('throws a ProductsCouldNotBeLoaded error after setting a products error', (done: DoneFn) => {
      const error = new Error('My cabbages!!!');

      const expectedError = new ProductsCouldNotBeLoaded(error);

      actions$ = of(DataDownloadProductActions.setProductsError({error}));
      effects.throwProductsError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
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

  describe('loadRelevantProductIds$', () => {
    const activeMapItems: ActiveMapItem[] = [
      createGb2WmsMapItemMock('id1'),
      createGb2WmsMapItemMock('id2'),
      createGb2WmsMapItemMock('id3'),
    ];

    it('dispatches DataDownloadProductActions.loadRelevantProductIds() with the service response on success', (done: DoneFn) => {
      store.overrideSelector(selectItems, activeMapItems);
      const productIds = ['prodId1'];
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadRelevanteProducts').and.returnValue(of(productIds));

      const expectedGuids = activeMapItems.map((item) => item.geometadataUuid!);
      const expectedAction = DataDownloadProductActions.setRelevantProductIds({relevantProductIds: productIds});

      actions$ = of(DataDownloadProductActions.loadRelevantProductIds());
      effects.loadRelevantProductIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(expectedGuids);
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches DataDownloadProductActions.setRelevantProductIdsError() with the error on failure', (done: DoneFn) => {
      store.overrideSelector(selectItems, activeMapItems);
      const error = new Error('My cabbages!!!');
      const geoshopProductsServiceSpy = spyOn(geoshopProductsService, 'loadRelevanteProducts').and.returnValue(throwError(() => error));

      const expectedGuids = activeMapItems.map((item) => item.geometadataUuid!);
      const expectedAction = DataDownloadProductActions.setRelevantProductIdsError({error});

      actions$ = of(DataDownloadProductActions.loadRelevantProductIds());
      effects.loadRelevantProductIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(expectedGuids);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('throwRelevantProductIdsError$', () => {
    it('throws a RelevantProductsCouldNotBeLoaded error after setting a relevant products ids error', (done: DoneFn) => {
      const error = new Error('My cabbages!!!');

      const expectedError = new RelevantProductsCouldNotBeLoaded(error);

      actions$ = of(DataDownloadProductActions.setRelevantProductIdsError({error}));
      effects.throwRelevantProductIdsError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
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

      const expectedAction = DataDownloadProductActions.setFilters({filters: dataDownloadFilters});

      actions$ = of(DataDownloadProductActions.setProducts({products}));
      effects.initializeDataDownloadFilters$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledOnceWith(products);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
