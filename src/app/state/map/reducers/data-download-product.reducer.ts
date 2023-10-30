import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';

export const dataDownloadProductFeatureKey = 'dataDownloadProduct';

export const initialState: DataDownloadProductState = {
  productsList: undefined,
  productsListLoadingState: undefined,
  relevantProductIds: [],
  relevantProductIdsLoadingState: undefined,
};

export const dataDownloadProductFeature = createFeature({
  name: dataDownloadProductFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadProductActions.loadProductsList, (state): DataDownloadProductState => {
      if (state.productsList) {
        return state;
      }
      return {...initialState, productsListLoadingState: 'loading'};
    }),
    on(DataDownloadProductActions.setProductsList, (state, {productsList}): DataDownloadProductState => {
      return {...state, productsList, productsListLoadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setProductsListError, (): DataDownloadProductState => {
      return {...initialState, productsListLoadingState: 'error'};
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
  selectProductsList,
  selectProductsListLoadingState,
  selectRelevantProductIds,
  selectRelevantProductIdsLoadingState,
} = dataDownloadProductFeature;
