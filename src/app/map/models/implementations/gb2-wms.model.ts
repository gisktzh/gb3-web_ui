import {FilterConfiguration, Map, MapLayer, SearchConfiguration, TimeSliderConfiguration} from '../../../shared/interfaces/topic.interface';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {TimeExtentUtils} from '../../../shared/utils/time-extent.utils';
import {AbstractActiveMapItemSettings, ActiveMapItem} from '../active-map-item.model';
import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';

export class Gb2WmsSettings extends AbstractActiveMapItemSettings {
  public readonly type = 'gb2Wms';
  public readonly url: string;
  public readonly timeSliderConfiguration?: TimeSliderConfiguration;
  public timeSliderExtent?: TimeExtent;
  public isNoticeMarkedAsRead = false;
  public readonly filterConfigurations?: FilterConfiguration[];
  public readonly searchConfigurations?: SearchConfiguration[];
  public readonly mapId: string;
  public readonly layers: MapLayer[];
  public readonly notice?: string;

  constructor(map: Map, layer?: MapLayer, timeExtent?: TimeExtent, filterConfigurations?: FilterConfiguration[]) {
    super();
    this.url = map.wmsUrl;
    this.mapId = map.id;
    this.layers = layer ? [layer] : map.layers;
    this.timeSliderConfiguration = map.timeSliderConfiguration;
    if (map.timeSliderConfiguration) {
      this.timeSliderExtent = timeExtent ?? TimeExtentUtils.createInitialTimeSliderExtent(map.timeSliderConfiguration);
    }
    this.filterConfigurations = filterConfigurations ?? map.filterConfigurations;
    this.searchConfigurations = map.searchConfigurations;
    this.notice = map.notice ?? undefined;
  }
}

export class Gb2WmsActiveMapItem extends ActiveMapItem {
  public readonly settings: Gb2WmsSettings;
  public readonly id: string;
  public readonly mapImageUrl: string;
  public readonly title: string;
  public readonly isSingleLayer: boolean;
  public readonly geometadataUuid: string | null;

  constructor(
    map: Map,
    layer?: MapLayer,
    visible?: boolean,
    opacity?: number,
    timeExtent?: TimeExtent,
    filterConfigurations?: FilterConfiguration[],
    isTemporary?: boolean,
  ) {
    super(visible, opacity, isTemporary);
    this.isSingleLayer = !!layer;
    this.id = layer ? Gb2WmsActiveMapItem.createSingleLayerId(map.id, layer.layer) : map.id;
    this.title = layer ? layer.title : map.title;
    this.mapImageUrl = map.icon;
    this.settings = new Gb2WmsSettings(map, layer, timeExtent, filterConfigurations);
    this.geometadataUuid = map.uuid;
  }

  public static createSingleLayerId(mapId: string, layerId: string): string {
    return `${mapId}_${layerId}`;
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addGb2WmsLayer(this, position);
  }
}
