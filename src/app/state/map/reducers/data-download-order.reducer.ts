import {createFeature, createReducer, on} from '@ngrx/store';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {produce} from 'immer';

export const dataDownloadOrderFeatureKey = 'dataDownloadOrder';

export const initialState: DataDownloadOrderState = {
  selection: undefined,
  order: undefined,
  savingState: undefined,
  statusJobs: [],
};

export const dataDownloadOrderFeature = createFeature({
  name: dataDownloadOrderFeatureKey,
  reducer: createReducer(
    initialState,
    on(DataDownloadOrderActions.setSelection, (state, {selection}): DataDownloadOrderState => {
      return {...state, selection};
    }),
    on(DataDownloadOrderActions.clearSelection, (state): DataDownloadOrderState => {
      return {...initialState, statusJobs: state.statusJobs};
    }),
    on(DataDownloadOrderActions.setOrder, (state, {order}): DataDownloadOrderState => {
      return {...state, order};
    }),
    on(DataDownloadOrderActions.sendOrder, (state): DataDownloadOrderState => {
      return {...state, savingState: 'loading'};
    }),
    on(DataDownloadOrderActions.setOrderResponse, (state): DataDownloadOrderState => {
      return {...state, savingState: 'loaded'};
    }),
    on(DataDownloadOrderActions.setOrderError, (state): DataDownloadOrderState => {
      return {...state, savingState: 'error'};
    }),
    on(
      DataDownloadOrderActions.requestOrderStatus,
      produce((draft, {orderId}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'loading';
        } else {
          draft.statusJobs.push({
            id: orderId,
            loadingState: 'loading',
          });
        }
      }),
    ),
    on(
      DataDownloadOrderActions.setOrderStatusResponse,
      produce((draft, {orderStatus}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderStatus.orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'loaded';
          existingStatusJob.status = orderStatus;
        } else {
          draft.statusJobs.push({
            id: orderStatus.orderId,
            loadingState: 'loading',
            status: orderStatus,
          });
        }
      }),
    ),
    on(
      DataDownloadOrderActions.setOrderStatusError,
      produce((draft, {orderId}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'error';
        } else {
          draft.statusJobs.push({
            id: orderId,
            loadingState: 'error',
          });
        }
      }),
    ),
  ),
});

export const {name, reducer, selectDataDownloadOrderState, selectSelection, selectOrder, selectSavingState, selectStatusJobs} =
  dataDownloadOrderFeature;
