import {HasVisibility} from '../../map/interfaces/has-visibility.interface';
import {MapServiceType} from '../../map/types/map-service.type';
import {ExternalLayerId} from '../types/external-layer-id.type';

interface AbstractExternalLayer<T extends ExternalLayerId> extends HasVisibility {
  type: MapServiceType;
  id: T;
  title: string;
}

export interface ExternalWmsLayer extends AbstractExternalLayer<number> {
  type: 'wms';
  name: string;
}

export interface ExternalKmlLayer extends AbstractExternalLayer<number> {
  type: 'kml';
}

export type ExternalLayer = ExternalWmsLayer | ExternalKmlLayer;
