import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface DataDownloadState {
  selection: DataDownloadSelection | undefined;
  products: Products | undefined;
  productsLoadingState: LoadingState;
  orderStatuses: OrderStatus[];
}
