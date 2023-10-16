import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

export const DataDownloadOrderActions = createActionGroup({
  source: 'DataDownloadOrder',
  events: {
    'Set Selection': props<{selection: DataDownloadSelection}>(),
    'Clear Selection': emptyProps(),
    'Set Order Status': props<{orderStatus: OrderStatus}>(),
  },
});
