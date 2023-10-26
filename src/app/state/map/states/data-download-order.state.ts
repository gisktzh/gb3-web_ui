import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

export interface DataDownloadOrderState {
  selection: DataDownloadSelection | undefined;
  orderStatuses: OrderStatus[];
}
