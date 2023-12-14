import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {MapServiceType} from '../../../map/types/map-service.type';

export const ExternalMapItemActions = createActionGroup({
  source: 'ExternalMapItem',
  events: {
    'Load Item': props<{serviceType: MapServiceType; url: string}>(),
    'Set Item': props<{externalMapItem: ExternalServiceActiveMapItem}>(),
    'Set Item Error': errorProps(),
    'Clear Loading State': emptyProps(),
  },
});
