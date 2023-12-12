import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';
import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';

export interface MapImportState extends HasLoadingState {
  externalMapItem: ExternalServiceActiveMapItem | undefined;
  layerSelections: ExternalLayerSelection[] | undefined;
  title: string | undefined;
}
