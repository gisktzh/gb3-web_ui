import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';
import {MapServiceType} from '../../../map/types/map-service.type';

export interface MapImportState {
  serviceType: MapServiceType | undefined;
  url: string | undefined;
  layerSelections: ExternalLayerSelection[] | undefined;
  title: string | undefined;
  imageFormat: string | undefined;
}
