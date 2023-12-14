import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';
import {AbstractExternalServiceSettings, ExternalServiceActiveMapItem} from '../external-service.model';
import {ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';

export class ExternalWmsServiceSettings extends AbstractExternalServiceSettings {
  public readonly mapServiceType = 'wms';
  public readonly layers: ExternalWmsLayer[];
  public readonly imageFormat: string | undefined;

  constructor(url: string, layers: ExternalWmsLayer[], imageFormat: string | undefined) {
    super(url);
    this.layers = layers;
    this.imageFormat = imageFormat;
  }
}

export class ExternalWmsActiveMapItem extends ExternalServiceActiveMapItem {
  public readonly settings: ExternalWmsServiceSettings;

  constructor(
    url: string,
    title: string,
    layers: ExternalWmsLayer[],
    imageFormat: string | undefined,
    visible?: boolean,
    opacity?: number,
  ) {
    super(title, visible, opacity);
    this.settings = new ExternalWmsServiceSettings(url, layers, imageFormat);
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addExternalWmsLayer(this, position);
  }
}
