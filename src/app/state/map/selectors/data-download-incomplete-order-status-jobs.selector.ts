import {createSelector} from '@ngrx/store';
import {selectStatusJobs} from '../reducers/data-download-order.reducer';
import {OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';

export const selectDataDownloadIncompleteOrderStatusJobs = createSelector(selectStatusJobs, (statusJobs): OrderStatusJob[] => {
  return statusJobs.filter((statusJob) => !statusJob.isCompleted);
});
