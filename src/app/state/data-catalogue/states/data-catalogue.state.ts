import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';

export interface DataCatalogueState extends HasLoadingState {
  items: OverviewMetadataItem[];
}
