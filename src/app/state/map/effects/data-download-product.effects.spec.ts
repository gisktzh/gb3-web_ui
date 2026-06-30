import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {DataDownloadProductEffects} from './data-download-product.effects';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {ProductsCouldNotBeLoaded, RelevantProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopProductsService} from '../../../shared/services/apis/gb3/gb3-geoshop-products.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectItems} from '../selectors/active-map-items.selector';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';
import {catchError} from 'rxjs';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAP_SERVICE} from '../../../app.tokens';

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
      imports: [],
      providers: [
        DataDownloadProductEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
    it('dispatches DataDownloadProductActions.loadProducts() after loading products and relevant products', () => {
      const expectedAction = DataDownloadProductActions.loadProducts();

      actions$ = of(DataDownloadProductActions.loadProductsAndRelevantProducts());
      effects.loadAllProducts$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('loadAllRelevantProducts$', () => {
    it('dispatches DataDownloadProductActions.loadRelevantProductIds() after loading products and relevant products', () => {
      const expectedAction = DataDownloadProductActions.loadRelevantProductIds();

      actions$ = of(DataDownloadProductActions.loadProductsAndRelevantProducts());
      effects.loadAllRelevantProducts$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('loadProducts$', () => {
    it('dispatches DataDownloadActions.setProducts() with the service response on success', () => {
      const products = productsMock;
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'loadProducts').mockReturnValue(of(products));

      const expectedAction = DataDownloadProductActions.setProducts({products});

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopProductsServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches DataDownloadActions.setProductsError() with the error on failure', () => {
      const error = new Error('My cabbages!!!');
      store.overrideSelector(selectProducts, []);
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'loadProducts').mockReturnValue(throwError(() => error));

      const expectedAction = DataDownloadProductActions.setProductsError({error});

      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopProductsServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches nothing if the products are already in the store', async () => {
      vi.useFakeTimers();
      const products = productsMock;
      store.overrideSelector(selectProducts, products);
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'loadProducts');

      let newAction;
      actions$ = of(DataDownloadProductActions.loadProducts());
      effects.loadProducts$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(geoshopProductsServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('throwProductsError$', () => {
    it('throws a ProductsCouldNotBeLoaded error after setting a products error', () => {
      const error = new Error('My cabbages!!!');

      const expectedError = new ProductsCouldNotBeLoaded(error);

      actions$ = of(DataDownloadProductActions.setProductsError({error}));
      effects.throwProductsError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('resetFiltersAndTermAfterClosingSideDrawer$', () => {
    it('dispatches DataDownloadProductActions.resetFiltersAndTerm() after closing the side drawer', () => {
      const expected = DataDownloadProductActions.resetFiltersAndTerm();

      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.resetFiltersAndTermAfterClosingSideDrawer$.subscribe((action) => {
        expect(action).toEqual(expected);
      });
    });
  });

  describe('loadRelevantProductIds$', () => {
    const activeMapItems: ActiveMapItem[] = [
      createGb2WmsMapItemMock('id1'),
      createGb2WmsMapItemMock('id2'),
      createGb2WmsMapItemMock('id3'),
    ];

    it('dispatches DataDownloadProductActions.loadRelevantProductIds() with the service response on success', () => {
      store.overrideSelector(selectItems, activeMapItems);
      const productIds = ['prodId1'];
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'loadRelevanteProducts').mockReturnValue(of(productIds));

      const expectedGuids = activeMapItems.map((item) => item.geometadataUuid!);
      const expectedAction = DataDownloadProductActions.setRelevantProductIds({relevantProductIds: productIds});

      actions$ = of(DataDownloadProductActions.loadRelevantProductIds());
      effects.loadRelevantProductIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopProductsServiceSpy).toHaveBeenCalledWith(expectedGuids);
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches DataDownloadProductActions.setRelevantProductIdsError() with the error on failure', () => {
      store.overrideSelector(selectItems, activeMapItems);
      const error = new Error('My cabbages!!!');
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'loadRelevanteProducts').mockReturnValue(throwError(() => error));

      const expectedGuids = activeMapItems.map((item) => item.geometadataUuid!);
      const expectedAction = DataDownloadProductActions.setRelevantProductIdsError({error});

      actions$ = of(DataDownloadProductActions.loadRelevantProductIds());
      effects.loadRelevantProductIds$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopProductsServiceSpy).toHaveBeenCalledWith(expectedGuids);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('throwRelevantProductIdsError$', () => {
    it('throws a RelevantProductsCouldNotBeLoaded error after setting a relevant products ids error', () => {
      const error = new Error('My cabbages!!!');

      const expectedError = new RelevantProductsCouldNotBeLoaded(error);

      actions$ = of(DataDownloadProductActions.setRelevantProductIdsError({error}));
      effects.throwRelevantProductIdsError$
        .pipe(
          catchError((e: unknown) => {
            expect(e).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('initializeDataDownloadFilters$', () => {
    it('dispatches DataDownloadProductActions.setFilters() after setting products', () => {
      const products = productsMock;
      const dataDownloadFilters: DataDownloadFilter[] = [{category: 'theme', filterValues: [], label: 'label'}];
      const geoshopProductsServiceSpy = vi.spyOn(geoshopProductsService, 'extractProductFilterValues').mockReturnValue(dataDownloadFilters);

      const expectedAction = DataDownloadProductActions.setFilters({filters: dataDownloadFilters});

      actions$ = of(DataDownloadProductActions.setProducts({products}));
      effects.initializeDataDownloadFilters$.subscribe((action) => {
        expect(geoshopProductsServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopProductsServiceSpy).toHaveBeenCalledWith(products);
        expect(action).toEqual(expectedAction);
      });
    });
  });
});
