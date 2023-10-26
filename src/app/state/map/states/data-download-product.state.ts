import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';

export interface DataDownloadProductState extends HasLoadingState {
  products: Products | undefined;
}
