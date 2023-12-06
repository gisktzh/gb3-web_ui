import {createFeature, createReducer, on} from '@ngrx/store';
import {produce} from 'immer';
import {DataDownloadOrderStatusJobState} from '../states/data-download-order-status-job.state';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';

export const dataDownloadOrderStatusJobFeatureKey = 'dataDownloadOrderStatusJob';

export const initialState: DataDownloadOrderStatusJobState = {
  statusJobs: [],
};

export const dataDownloadOrderStatusJobFeature = createFeature({
  name: dataDownloadOrderStatusJobFeatureKey,
  reducer: createReducer(
    initialState,
    on(
      DataDownloadOrderStatusJobActions.requestOrderStatus,
      produce((draft, {orderId, orderTitle}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'loading';
        } else {
          draft.statusJobs.push({
            id: orderId,
            title: orderTitle,
            loadingState: 'loading',
            consecutiveErrorsCount: 0,
            isCompleted: false,
            isAborted: false,
            isCancelled: false,
          });
        }
      }),
    ),
    on(
      DataDownloadOrderStatusJobActions.setOrderStatusResponse,
      produce((draft, {orderStatus}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderStatus.orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'loaded';
          existingStatusJob.status = orderStatus;
          existingStatusJob.consecutiveErrorsCount = 0;
        }
      }),
    ),
    on(
      DataDownloadOrderStatusJobActions.setOrderStatusError,
      produce((draft, {orderId, maximumNumberOfConsecutiveStatusJobErrors}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.loadingState = 'error';
          existingStatusJob.consecutiveErrorsCount += 1;
          existingStatusJob.isAborted = existingStatusJob.consecutiveErrorsCount >= maximumNumberOfConsecutiveStatusJobErrors;
        }
      }),
    ),
    on(
      DataDownloadOrderStatusJobActions.completeOrderStatus,
      produce((draft, {orderId}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.isCompleted = true;
        }
      }),
    ),
    on(
      DataDownloadOrderStatusJobActions.cancelOrderStatus,
      produce((draft, {orderId}) => {
        const existingStatusJob = draft.statusJobs.find((statusJob) => statusJob.id === orderId);
        if (existingStatusJob) {
          existingStatusJob.isCancelled = true;
        }
      }),
    ),
  ),
});

export const {name, reducer, selectDataDownloadOrderStatusJobState, selectStatusJobs} = dataDownloadOrderStatusJobFeature;
