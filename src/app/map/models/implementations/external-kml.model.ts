import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';
import {AbstractExternalServiceSettings, ExternalServiceActiveMapItem} from '../external-service.model';
import {ExternalKmlLayer} from '../../../shared/interfaces/external-layer.interface';

export class ExternalKmlServiceSettings extends AbstractExternalServiceSettings {
  public readonly mapServiceType = 'kml';
  public readonly layers: ExternalKmlLayer[];

  constructor(url: string, layers: ExternalKmlLayer[]) {
    super(url);
    this.layers = layers;
  }
}

export class ExternalKmlActiveMapItem extends ExternalServiceActiveMapItem {
  public readonly settings: ExternalKmlServiceSettings;

  constructor(url: string, title: string, layers: ExternalKmlLayer[], visible?: boolean, opacity?: number) {
    super(title, visible, opacity);
    this.settings = new ExternalKmlServiceSettings(url, layers);
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addExternalKmlLayer(this, position);
  }
}
