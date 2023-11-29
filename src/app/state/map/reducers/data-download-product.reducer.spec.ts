import {initialState, reducer} from './data-download-product.reducer';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';

describe('data download product reducer', () => {
  const existingStateProducts: Product[] = [
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
  const existingStateFilters: DataDownloadFilter[] = [
    {
      category: 'theme',
      filterValues: [
        {value: 'activeFilter', isActive: true},
        {value: 'inactiveFilter', isActive: false},
      ],
      label: 'themelabel',
    },
    {
      category: 'format',
      filterValues: [
        {value: 'activeFilter', isActive: true},
        {value: 'inactiveFilter', isActive: false},
      ],
      label: 'formatlabel',
    },
  ];
  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: DataDownloadProductState;

  beforeEach(() => {
    existingState = {
      products: existingStateProducts,
      productsLoadingState: 'loaded',
      relevantProductIds: ['1337_42_666_9001'],
      relevantProductIdsLoadingState: 'loaded',
      filterTerm: 'I want it all, I want it all and I want it now',
      filters: existingStateFilters,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadProducts', () => {
    it('sets the products loading state to `loading` if there are no products loaded yet; resets everything else', () => {
      existingState.products = [];

      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(initialState.products);
      expect(state.productsLoadingState).toBe('loading');
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(initialState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(initialState.filterTerm);
      expect(state.filters).toEqual(initialState.filters);
    });

    it('keeps everything as it is if there are already products', () => {
      const action = DataDownloadProductActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('setProducts', () => {
    it('sets productsLoadingState to loaded and products to the given value; resets everything else', () => {
      existingState.productsLoadingState = 'loading';
      existingState.products = [];
      const expectedProducts = existingStateProducts;

      const action = DataDownloadProductActions.setProducts({products: expectedProducts});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(expectedProducts);
      expect(state.productsLoadingState).toBe('loaded');
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(initialState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(initialState.filterTerm);
      expect(state.filters).toEqual(initialState.filters);
    });
  });

  describe('setProductsError', () => {
    it('sets productsLoadingState to error; resets everything else', () => {
      const action = DataDownloadProductActions.setProductsError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(initialState.products);
      expect(state.productsLoadingState).toBe('error');
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(initialState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(initialState.filterTerm);
      expect(state.filters).toEqual(initialState.filters);
    });
  });

  describe('loadRelevantProductsIds', () => {
    it('sets relevantProductIdsLoadingState to loading and resets relevantProductIds; keeps everything else', () => {
      const action = DataDownloadProductActions.loadRelevantProductIds();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe('loading');
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('setRelevantProductsIds', () => {
    it('sets relevantProductIdsLoadingState to loaded and relevantProductIds to the given value; keeps everything else', () => {
      const expectedRelevantProductIds = ['1337'];

      const action = DataDownloadProductActions.setRelevantProductIds({relevantProductIds: expectedRelevantProductIds});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(expectedRelevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe('loaded');
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('setRelevantProductIdsError', () => {
    it('sets relevantProductIdsLoadingState to error and resets relevantProductIds; keeps everything else', () => {
      const action = DataDownloadProductActions.setRelevantProductIdsError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(initialState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe('error');
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('setFilterTerm', () => {
    it('sets the filterTerm to the given value; keeps everything else', () => {
      const expectedFilterTerm = 'I want it all, I want it all and I want it now';

      const action = DataDownloadProductActions.setFilterTerm({term: expectedFilterTerm});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(expectedFilterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('clearFilterTerm', () => {
    it('resets the filterTerm; keeps everything else', () => {
      const action = DataDownloadProductActions.clearFilterTerm();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(initialState.filterTerm);
      expect(state.filters).toEqual(existingState.filters);
    });
  });

  describe('setFilters', () => {
    it('sets the filters to the given value; keeps everything else', () => {
      const expectedFilters: DataDownloadFilter[] = [{category: 'availability', filterValues: [], label: 'new filters'}];

      const action = DataDownloadProductActions.setFilters({filters: expectedFilters});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(expectedFilters);
    });
  });

  describe('resetFilters', () => {
    it('sets isActive of all existing filters to false; keeps everything else', () => {
      const expectedFilters: DataDownloadFilter[] = existingStateFilters.map((filter) => ({
        ...filter,
        filterValues: filter.filterValues.map((filterValue) => ({...filterValue, isActive: false})),
      }));

      const action = DataDownloadProductActions.resetFilters();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(expectedFilters);
    });
  });

  describe('toggleFilter', () => {
    it('toggles isActive of a filter; keeps everything else', () => {
      const category = existingStateFilters[1].category;
      const value = existingStateFilters[1].filterValues[0].value;

      const expectedFilters: DataDownloadFilter[] = existingStateFilters.map((filter) => ({
        ...filter,
        filterValues: filter.filterValues.map((filterValue) => {
          if (filterValue.value === value && filter.category === category) {
            return {value: filterValue.value, isActive: !filterValue.isActive};
          }
          return {...filterValue};
        }),
      }));

      const action = DataDownloadProductActions.toggleFilter({category, value});
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(existingState.filterTerm);
      expect(state.filters).toEqual(expectedFilters);
    });
  });

  describe('resetFiltersAndTerm', () => {
    it('resets filterTerm and sets isActive of all existing filters to false; keeps everything else', () => {
      const expectedFilters: DataDownloadFilter[] = existingStateFilters.map((filter) => ({
        ...filter,
        filterValues: filter.filterValues.map((filterValue) => ({...filterValue, isActive: false})),
      }));

      const action = DataDownloadProductActions.resetFiltersAndTerm();
      const state = reducer(existingState, action);

      expect(state.products).toEqual(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.relevantProductIds).toEqual(existingState.relevantProductIds);
      expect(state.relevantProductIdsLoadingState).toBe(existingState.relevantProductIdsLoadingState);
      expect(state.filterTerm).toBe(initialState.filterTerm);
      expect(state.filters).toEqual(expectedFilters);
    });
  });
});
