import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';
import {AbstractExternalServiceSettings, ExternalServiceActiveMapItem} from '../external-service.model';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';

export class ExternalWmsServiceSettings extends AbstractExternalServiceSettings {
  public readonly mapServiceType = 'wms';
  public readonly layers: ExternalLayer<number>[];

  constructor(url: string, layers: ExternalLayer<number>[]) {
    super(url);
    this.layers = layers;
  }
}

export class ExternalWmsActiveMapItem extends ExternalServiceActiveMapItem {
  public readonly settings: ExternalWmsServiceSettings;

  constructor(url: string, title: string, layers: ExternalLayer<number>[], visible?: boolean, opacity?: number) {
    super(title, visible, opacity);
    this.settings = new ExternalWmsServiceSettings(url, layers);
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addExternalWmsLayer(this, position);
  }
}
