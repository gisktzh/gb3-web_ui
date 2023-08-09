import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {DataCatalogueFilterKey} from '../../../shared/types/data-catalogue-filter';

export interface DataCatalogueState extends HasLoadingState {
  items: OverviewMetadataItem[];
  activeFilters: {
    key: DataCatalogueFilterKey;
    value: string;
  }[];
}
