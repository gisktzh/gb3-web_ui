import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {produce} from 'immer';

export const dataDownloadOrderFeatureKey = 'dataDownloadOrder';

export const initialState: DataDownloadOrderState = {
  selection: undefined,
  orderStatuses: [],
};

export const dataDownloadOrderFeature = createFeature({
  name: dataDownloadOrderFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadOrderActions.setSelection, (state, {selection}): DataDownloadOrderState => {
      return {...state, selection};
    }),
    on(DataDownloadOrderActions.clearSelection, (state): DataDownloadOrderState => {
      return {...state, selection: initialState.selection};
    }),
    on(
      DataDownloadOrderActions.setOrderStatus,
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

export const {name, reducer, selectDataDownloadOrderState, selectSelection, selectOrderStatuses} = dataDownloadOrderFeature;
