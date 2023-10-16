import {initialState, reducer} from './data-download-product.reducer';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';

describe('data download order reducer', () => {
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

  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: DataDownloadProductState;

  beforeEach(() => {
    existingState = {
      products: productsMock,
      loadingState: 'loaded',
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
    it('sets the products loading state to `loading` if there are no products loaded yet', () => {
      existingState.products = undefined;
      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toBe(initialState.products);
      expect(state.loadingState).toBe('loading');
    });

    it('changes nothing if there are already products in the state', () => {
      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toBe(existingState.products);
      expect(state.loadingState).toBe(existingState.loadingState);
    });
  });

  describe('setProducts', () => {
    it('sets the products loading state to `loaded` on success and sets the products', () => {
      existingState.loadingState = 'loading';
      existingState.products = undefined;
      const action = DataDownloadProductActions.setProducts({products: productsMock});
      const state = reducer(existingState, action);

      expect(state.products).toBe(productsMock);
      expect(state.loadingState).toBe('loaded');
    });
  });

  describe('setProductsError', () => {
    it('sets the products loading state to `error` on failure and resets products', () => {
      const action = DataDownloadProductActions.setProductsError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.products).toBe(initialState.products);
      expect(state.loadingState).toBe('error');
    });
  });
});
