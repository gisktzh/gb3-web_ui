import {AbstractActiveMapItemSettings, ActiveMapItem} from './active-map-item.model';
import {v4 as uuidv4} from 'uuid';
import {MapServiceType} from '../types/map-service.type';
import {ExternalWmsServiceSettings} from './implementations/external-wms.model';
import {ExternalKmlServiceSettings} from './implementations/external-kml.model';

export abstract class AbstractExternalServiceSettings extends AbstractActiveMapItemSettings {
  public readonly type = 'externalService';
  public abstract readonly mapServiceType: MapServiceType;
  public readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }
}

export type ExternalServiceSettings = ExternalWmsServiceSettings | ExternalKmlServiceSettings;

export abstract class ExternalServiceActiveMapItem extends ActiveMapItem {
  public abstract override readonly settings: ExternalServiceSettings;
  public readonly id: string;
  public readonly title: string;
  public readonly mapImageUrl = null; // TODO WES maybe we can extract this
  public readonly isSingleLayer = true; // it has layers but they won't be visible
  public readonly geometadataUuid = null;

  constructor(title: string, visible?: boolean, opacity?: number) {
    super(visible, opacity);
    this.id = uuidv4();
    this.title = title;
  }
}
