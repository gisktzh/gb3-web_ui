import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadProductState} from '../states/data-download-product.state';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';

export const dataDownloadProductFeatureKey = 'dataDownloadProduct';

export const initialState: DataDownloadProductState = {
  products: undefined,
  loadingState: undefined,
};

export const dataDownloadProductFeature = createFeature({
  name: dataDownloadProductFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadProductActions.loadProducts, (state): DataDownloadProductState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(DataDownloadProductActions.setProducts, (state, {products}): DataDownloadProductState => {
      return {...state, products, loadingState: 'loaded'};
    }),
    on(DataDownloadProductActions.setProductsError, (): DataDownloadProductState => {
      return {...initialState, loadingState: 'error'};
    }),
  ),
});

export const {name, reducer, selectDataDownloadProductState, selectProducts, selectLoadingState} = dataDownloadProductFeature;
