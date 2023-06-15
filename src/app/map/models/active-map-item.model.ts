import {LoadingState} from '../../shared/types/loading-state';
import {FilterConfiguration, Map, MapLayer, SearchConfiguration, TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';
import {HasViewProcessState} from '../../shared/interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TimeExtentUtils} from '../../shared/utils/time-extent.utils';
import {IsImmerable} from '../../shared/interfaces/immerable.interface';
import {immerable} from 'immer';

import {AddToMapVisitor} from '../interfaces/add-to-map.visitor';

type ActiveMapItemType = 'gb2Wms' | 'drawing';

abstract class AbstractActiveMapItemConfiguration implements IsImmerable {
  public readonly [immerable] = true;
  public abstract readonly type: ActiveMapItemType;
}

class Gb2WmsMapItemConfiguration extends AbstractActiveMapItemConfiguration {
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

  constructor(map: Map, layer?: MapLayer) {
    super();
    this.url = map.wmsUrl;
    this.mapId = map.id;
    this.layers = layer ? [layer] : map.layers;
    this.timeSliderConfiguration = map.timeSliderConfiguration;
    if (map.timeSliderConfiguration) {
      this.timeSliderExtent = TimeExtentUtils.createInitialTimeSliderExtent(map.timeSliderConfiguration);
    }
    this.filterConfigurations = map.filterConfigurations;
    this.searchConfigurations = map.searchConfigurations;
    this.notice = map.notice ?? undefined;
  }
}

class DrawingLayerTestConfiguration extends AbstractActiveMapItemConfiguration {
  public readonly type = 'drawing';
}

export type ActiveMapItemConfiguration = Gb2WmsMapItemConfiguration | DrawingLayerTestConfiguration;

export abstract class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState, IsImmerable {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly mapImageUrl: string;
  public abstract readonly configuration: ActiveMapItemConfiguration;
  public abstract readonly isSingleLayer: boolean;

  public readonly [immerable] = true;
  public visible: boolean;
  public opacity: number;
  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';

  protected constructor(visible?: boolean, opacity?: number) {
    this.visible = visible ?? true;
    this.opacity = opacity ?? 1;
  }

  /**
   * Takes an addToMapVisitor and calls the appropriate submethod. This is a variation of the Visitor pattern in that the MapService
   * implements this interface and can handle different types of map to be added, without having to use switch cases.
   *
   * @param addToMapVisitor
   * @param position
   */
  public abstract addToMap(addToMapVisitor: AddToMapVisitor, position: number): void;
}

export class Gb2WmsActiveMapItem extends ActiveMapItem {
  public readonly configuration: Gb2WmsMapItemConfiguration;
  public readonly id: string;
  public readonly mapImageUrl: string;
  public readonly title: string;
  public readonly isSingleLayer: boolean;

  constructor(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number) {
    super(visible, opacity);

    this.isSingleLayer = !!layer;
    this.id = layer ? Gb2WmsActiveMapItem.createSingleLayerId(map.id, layer.layer) : map.id;
    this.title = layer ? layer.title : map.title;
    this.mapImageUrl = map.icon;
    this.configuration = new Gb2WmsMapItemConfiguration(map, layer);
  }

  public override addToMap(addToMapVisitor: AddToMapVisitor, position: number) {
    addToMapVisitor.addGb2WmsLayer(this, position);
  }

  public static createSingleLayerId(mapId: string, layerId: string): string {
    return `${mapId}_${layerId}`;
  }
}
