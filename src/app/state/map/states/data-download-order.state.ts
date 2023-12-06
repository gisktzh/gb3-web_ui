import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {Order} from '../../../shared/interfaces/geoshop-order.interface';

export interface DataDownloadOrderState extends HasSavingState {
  selection: DataDownloadSelection | undefined;
  order: Order | undefined;
}
