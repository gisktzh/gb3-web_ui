import {Pipe, PipeTransform} from '@angular/core';
import {OrderStatusJob} from '../../shared/interfaces/geoshop-order-status.interface';
import {DataDownloadConstants} from '../../shared/constants/data-download.constants';

@Pipe({
  name: 'dataDownloadOrderStatus',
})
export class DataDownloadOrderStatusPipe implements PipeTransform {
  public transform(orderStatusJob: OrderStatusJob): string {
    if (orderStatusJob.isAborted) {
      return DataDownloadConstants.ABORTED_STATUS_JOB_TEXT;
    }
    if (orderStatusJob.isCancelled) {
      return DataDownloadConstants.CANCELLED_STATUS_JOB_TEXT;
    }
    if (!orderStatusJob.status) {
      return DataDownloadConstants.NEW_STATUS_JOB_TEXT;
    }
    switch (orderStatusJob.status.status.type) {
      case 'submitted':
        return DataDownloadConstants.STATUS_JOB_SUBMITTED_TEXT;
      case 'queued':
        return DataDownloadConstants.STATUS_JOB_QUEUED_TEXT;
      case 'working':
        return DataDownloadConstants.STATUS_JOB_WORKING_TEXT;
      case 'success':
        return DataDownloadConstants.STATUS_JOB_SUCCESS_TEXT;
      case 'failure':
        if (orderStatusJob.status.status.message) {
          return `${DataDownloadConstants.STATUS_JOB_FAILURE_MESSAGE_PREFIX} '${orderStatusJob.status.status.message}'`;
        }
        return DataDownloadConstants.STATUS_JOB_FAILURE_DEFAULT_TEXT;
      case 'unknown':
        return DataDownloadConstants.STATUS_JOB_UNKNOWN_TEXT;
    }
  }
}
