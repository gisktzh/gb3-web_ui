import {createActionGroup, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {MapServiceType} from '../../../map/types/map-service.type';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';

export const MapImportActions = createActionGroup({
  source: 'MapImport',
  events: {
    'Load Temporary External Map': props<{url: string; serviceType: MapServiceType}>(),
    'Set Temporary External Map': props<{temporaryExternalMapItem: ExternalServiceActiveMapItem}>(),
    'Set Temporary External Map Error': errorProps(),
    'Set External Map Item': props<{externalMapItem: ExternalServiceActiveMapItem}>(),
    'Set External Map Item Title': props<{title: string}>(),
  },
});
