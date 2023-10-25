import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {ProductsList} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export interface DataDownloadProductState extends HasLoadingState {
  products: ProductsList | undefined;
}
