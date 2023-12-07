import {createSelector} from '@ngrx/store';
import {OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';
import {selectStatusJobs} from '../reducers/data-download-order-status-job.reducer';

export const selectIncompleteOrderStatusJobs = createSelector(selectStatusJobs, (statusJobs): OrderStatusJob[] => {
  return statusJobs.filter((statusJob) => !statusJob.isCompleted);
});
