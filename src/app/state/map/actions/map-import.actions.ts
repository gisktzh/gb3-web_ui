import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {MapServiceType} from '../../../map/types/map-service.type';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';
import {ExternalLayerId} from '../../../shared/types/external-layer-id.type';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';

export const MapImportActions = createActionGroup({
  source: 'MapImport',
  events: {
    'Load External Map Item': props<{url: string; serviceType: MapServiceType}>(),
    'Set External Map Item': props<{externalMapItem: ExternalServiceActiveMapItem}>(),
    'Set External Map Item Error': errorProps(),
    'Set Layer Selections': props<{layers: ExternalLayer[]}>(),
    'Set All Selected Layers': props<{isSelected: boolean}>(),
    'Toggle Selected Layer': props<{layerId: ExternalLayerId}>(),
    'Set Title': props<{title: string}>(),
    'Add External Map Item': emptyProps(),
    'Clear External Map Item And Selection': emptyProps(),
  },
});
