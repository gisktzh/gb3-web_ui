import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {Order} from '../../../shared/interfaces/geoshop-order.interface';

export interface DataDownloadOrderState extends HasSavingState {
  selection: DataDownloadSelection | undefined;
  order: Order | undefined;
  statusJobs: OrderStatusJob[];
}
