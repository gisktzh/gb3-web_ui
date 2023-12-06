import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {produce} from 'immer';

export const dataDownloadOrderFeatureKey = 'dataDownloadOrder';

export const initialState: DataDownloadOrderState = {
  selection: undefined,
  order: undefined,
  savingState: undefined,
};

export const dataDownloadOrderFeature = createFeature({
  name: dataDownloadOrderFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadOrderActions.setSelection, (_, {selection}): DataDownloadOrderState => {
      return {...initialState, selection};
    }),
    on(DataDownloadOrderActions.clearSelection, (): DataDownloadOrderState => {
      return {...initialState};
    }),
    on(DataDownloadOrderActions.setOrder, (state, {order}): DataDownloadOrderState => {
      return {...state, order};
    }),
    on(
      DataDownloadOrderActions.updateProductsInOrder,
      produce((draft, {productId, formatIds}) => {
        if (draft.order) {
          // remove all products with the same ID and then add the new formats afterwards
          draft.order.products = draft.order.products.filter((orderProduct) => orderProduct.id !== productId);
          formatIds.forEach((formatId) => draft.order!.products.push({id: productId, formatId}));
        }
      }),
    ),
    on(
      DataDownloadOrderActions.removeProductsWithSameIdInOrder,
      produce((draft, {productId}) => {
        if (draft.order) {
          draft.order.products = draft.order.products.filter((orderProduct) => orderProduct.id !== productId);
        }
      }),
    ),
    on(
      DataDownloadOrderActions.setEmailInOrder,
      produce((draft, {email}) => {
        if (draft.order) {
          draft.order.email = email;
        }
      }),
    ),
    on(DataDownloadOrderActions.sendOrder, (state): DataDownloadOrderState => {
      return {...state, savingState: 'loading'};
    }),
    on(DataDownloadOrderActions.setSendOrderResponse, (state): DataDownloadOrderState => {
      return {...state, savingState: 'loaded'};
    }),
    on(DataDownloadOrderActions.setSendOrderError, (state): DataDownloadOrderState => {
      return {...state, savingState: 'error'};
    }),
  ),
});

export const {name, reducer, selectDataDownloadOrderState, selectSelection, selectOrder, selectSavingState} = dataDownloadOrderFeature;
