import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapServiceType} from '../../../map/types/map-service.type';
import {ExternalLayerId} from '../../../shared/types/external-layer-id.type';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';

export const MapImportActions = createActionGroup({
  source: 'MapImport',
  events: {
    'Set Service Type': props<{serviceType: MapServiceType}>(),
    'Set Url': props<{url: string}>(),
    'Set Layer Selections': props<{layers: ExternalLayer[]}>(),
    'Select All Layers': props<{isSelected: boolean}>(),
    'Toggle Layer Selection': props<{layerId: ExternalLayerId}>(),
    'Set Title': props<{title: string}>(),
    'Import External Map Item': emptyProps(),
    'Clear All': emptyProps(),
  },
});
