import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const DataCatalogueActions = createActionGroup({
  source: 'DataCatalogue',
  events: {
    'Load Catalogue': emptyProps(),
    'Set Catalogue': props<{items: OverviewMetadataItem[]}>(),
    'Set Error': errorProps(),
  },
});
