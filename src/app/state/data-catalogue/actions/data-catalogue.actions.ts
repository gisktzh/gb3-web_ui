import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {DataCatalogueFilterKey} from '../../../shared/types/data-catalogue-filter';

export const DataCatalogueActions = createActionGroup({
  source: 'DataCatalogue',
  events: {
    'Load Catalogue': emptyProps(),
    'Set Catalogue': props<{items: OverviewMetadataItem[]}>(),
    'Set Error': errorProps(),
    'Toggle Filter': props<{key: DataCatalogueFilterKey; value: string}>(),
  },
});
