import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {produce} from 'immer';

export const dataDownloadProductFeatureKey = 'dataDownloadProduct';

export const initialState: DataDownloadProductState = {
  products: [],
  productsLoadingState: undefined,
  relevantProductIds: [],
  relevantProductIdsLoadingState: undefined,
  filterTerm: undefined,
  filters: [],
};

export const dataDownloadProductFeature = createFeature({
  name: dataDownloadProductFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadProductActions.loadProducts, (state): DataDownloadProductState => {
      if (state.products.length > 0) {
        return state;
      }
      return {...initialState, productsLoadingState: 'loading'};
    }),
    on(DataDownloadProductActions.setProducts, (state, {products}): DataDownloadProductState => {
      return {...initialState, products, productsLoadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setProductsError, (): DataDownloadProductState => {
      return {...initialState, productsLoadingState: 'error'};
    }),
    on(DataDownloadProductActions.loadRelevantProductIds, (state): DataDownloadProductState => {
      return {...state, relevantProductIds: initialState.relevantProductIds, relevantProductIdsLoadingState: 'loading'};
    }),
    on(DataDownloadProductActions.setRelevantProductIds, (state, {relevantProductIds}): DataDownloadProductState => {
      return {...state, relevantProductIds, relevantProductIdsLoadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setRelevantProductIdsError, (state): DataDownloadProductState => {
      return {...state, relevantProductIds: initialState.relevantProductIds, relevantProductIdsLoadingState: 'error'};
    }),
    on(DataDownloadProductActions.setFilterTerm, (state, {term}): DataDownloadProductState => {
      return {...state, filterTerm: term};
    }),
    on(DataDownloadProductActions.clearFilterTerm, (state): DataDownloadProductState => {
      return {...state, filterTerm: initialState.filterTerm};
    }),
    on(DataDownloadProductActions.setFilters, (state, {filters}): DataDownloadProductState => {
      return {...state, filters};
    }),
    on(
      DataDownloadProductActions.resetFilters,
      produce((draft) => {
        draft.filters.forEach((filter) => filter.filterValues.forEach((filterValue) => (filterValue.isActive = false)));
      }),
    ),
    on(
      DataDownloadProductActions.toggleFilter,
      produce((draft, {category, value}) => {
        draft.filters
          .find((filter) => filter.category === category)!
          .filterValues.filter((filterValue) => filterValue.value === value)
          .forEach((filterValue) => {
            filterValue.isActive = !filterValue.isActive;
          });
      }),
    ),
    on(
      DataDownloadProductActions.resetFiltersAndTerm,
      produce((draft) => {
        draft.filters.forEach((filter) => filter.filterValues.forEach((filterValue) => (filterValue.isActive = false)));
        draft.filterTerm = initialState.filterTerm;
      }),
    ),
  ),
});

export const {
  name,
  reducer,
  selectDataDownloadProductState,
  selectProducts,
  selectProductsLoadingState,
  selectRelevantProductIds,
  selectRelevantProductIdsLoadingState,
  selectFilters,
  selectFilterTerm,
} = dataDownloadProductFeature;
