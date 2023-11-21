import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';

export const dataDownloadProductFeatureKey = 'dataDownloadProduct';

export const initialState: DataDownloadProductState = {
  products: [],
  productsLoadingState: undefined,
  relevantProductIds: [],
  relevantProductIdsLoadingState: undefined,
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
      return {...state, products, productsLoadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setProductsError, (): DataDownloadProductState => {
      return {...initialState, productsLoadingState: 'error'};
    }),
    on(DataDownloadProductActions.loadRelevantProductsIds, (state): DataDownloadProductState => {
      return {...state, relevantProductIds: initialState.relevantProductIds, relevantProductIdsLoadingState: 'loading'};
    }),
    on(DataDownloadProductActions.setRelevantProductsIds, (state, {productIds}): DataDownloadProductState => {
      return {...state, relevantProductIds: productIds, relevantProductIdsLoadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setRelevantProductsIdsError, (state): DataDownloadProductState => {
      return {...state, relevantProductIds: initialState.relevantProductIds, relevantProductIdsLoadingState: 'error'};
    }),
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
} = dataDownloadProductFeature;
