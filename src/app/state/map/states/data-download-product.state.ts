import {ProductsList} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface DataDownloadProductState {
  productsList: ProductsList | undefined;
  productsListLoadingState: LoadingState;
  relevantProductIds: string[];
  relevantProductIdsLoadingState: LoadingState;
}
