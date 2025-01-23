import {BoundingBoxWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface DataDownloadRegionState {
  federation: BoundingBoxWithGeometry | undefined;
  federationLoadingState: LoadingState;
  canton: BoundingBoxWithGeometry | undefined;
  cantonLoadingState: LoadingState;
  municipalities: Municipality[];
  municipalitiesLoadingState: LoadingState;
}
