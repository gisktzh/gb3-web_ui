import {initialState, reducer} from './data-download-product.reducer';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {Municipality, Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';

describe('data download order reducer', () => {
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

  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: DataDownloadProductState;

  beforeEach(() => {
    existingState = {
      products: productsMock,
      productsLoadingState: 'loaded',
      relevantProductIds: ['112'],
      relevantProductIdsLoadingState: 'loaded',
      filterTerm: undefined,
      filters: [],
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadProducts', () => {
    it('sets the products loading state to `loading` and reset everything else if there are no products loaded yet', () => {
      existingState.products = [];
      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(initialState.products);
      expect(state.productsLoadingState).toBe('loading');
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(initialState.relevantProductIdsLoadingState);
    });

    it('changes nothing if there are already products in the state', () => {
      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
    });
  });

  describe('setProducts', () => {
    it('sets the products loading state to `loaded` on success and sets the products', () => {
      existingState.productsLoadingState = 'loading';
      existingState.products = [];
      const action = DataDownloadProductActions.setProducts({products: productsMock});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(productsMock);
      expect(state.productsLoadingState).toBe('loaded');
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
    });
  });

  describe('setProductsError', () => {
    it('sets the products loading state to `error` on failure and resets the state', () => {
      const action = DataDownloadProductActions.setProductsError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(initialState.products);
      expect(state.productsLoadingState).toBe('error');
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(initialState.relevantProductIdsLoadingState);
    });
  });
});
