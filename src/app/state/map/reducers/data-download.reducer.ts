import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadState} from '../states/data-download.state';
import {DataDownloadActions} from '../actions/data-download.actions';
import {produce} from 'immer';

export const dataDownloadFeatureKey = 'dataDownload';

export const initialState: DataDownloadState = {
  selection: undefined,
  products: undefined,
  productsLoadingState: undefined,
  orderStatuses: [],
};

export const dataDownloadFeature = createFeature({
  name: dataDownloadFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadActions.setSelection, (state, {selection}): DataDownloadState => {
      return {...state, selection};
    }),
    on(DataDownloadActions.clearSelection, (state): DataDownloadState => {
      return {...state, selection: initialState.selection};
    }),
    on(DataDownloadActions.loadProducts, (state): DataDownloadState => {
      // If we already have products, we do not load them again
      if (state.products) {
        return state;
      }
      return {...state, productsLoadingState: 'loading'};
    }),
    on(DataDownloadActions.setProducts, (state, {products}): DataDownloadState => {
      return {...state, products, productsLoadingState: 'loaded'};
    }),
    on(DataDownloadActions.setProductsError, (state): DataDownloadState => {
      return {...state, products: initialState.products, productsLoadingState: 'error'};
    }),
    on(
      DataDownloadActions.setOrderStatus,
      produce((draft, {orderStatus}) => {
        const existingStatusIndex = draft.orderStatuses.findIndex((status) => status.orderId === orderStatus.orderId);
        if (existingStatusIndex < 0) {
          // status doesn't exist yet
          draft.orderStatuses.push(orderStatus);
        } else {
          draft.orderStatuses[existingStatusIndex] = orderStatus;
        }
      }),
    ),
  ),
});

export const {name, reducer, selectDataDownloadState, selectSelection, selectProducts, selectProductsLoadingState, selectOrderStatuses} =
  dataDownloadFeature;
