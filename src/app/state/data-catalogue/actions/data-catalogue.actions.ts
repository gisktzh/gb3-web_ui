import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {DataCatalogueFilterKey} from '../../../shared/types/data-catalogue-filter';

import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';

export const DataCatalogueActions = createActionGroup({
  source: 'DataCatalogue',
  events: {
    'Load Catalogue': emptyProps(),
    'Set Catalogue': props<{items: OverviewMetadataItem[]}>(),
    'Set Error': errorProps(),
    'Set Filters': props<{dataCatalogueFilters: DataCatalogueFilter[]}>(),
    'Toggle Filter': props<{key: DataCatalogueFilterKey; value: string}>(),
    'Reset Filters': emptyProps(),
  },
});
