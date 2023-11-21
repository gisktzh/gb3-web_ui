import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface DataDownloadProductState {
  products: Product[];
  productsLoadingState: LoadingState;
  relevantProductIds: string[];
  relevantProductIdsLoadingState: LoadingState;
}
