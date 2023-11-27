import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';

export interface DataDownloadProductState {
  products: Product[];
  productsLoadingState: LoadingState;
  relevantProductIds: string[];
  relevantProductIdsLoadingState: LoadingState;
  filterTerm: string | undefined;
  filters: DataDownloadFilter[];
}
