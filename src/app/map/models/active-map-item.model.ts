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

type ActiveMapItemType = 'gb2Wms' | 'drawing';

abstract class AbstractActiveMapItemConfiguration implements IsImmerable {
  public readonly [immerable] = true;
  public abstract readonly type: ActiveMapItemType;
}

export class Gb2WmsMapItemConfiguration extends AbstractActiveMapItemConfiguration {
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

  public static createSingleLayerId(mapId: string, layerId: string): string {
    return `${mapId}_${layerId}`;
  }
}

export class DrawingLayerTestConfiguration extends AbstractActiveMapItemConfiguration {
  public readonly type = 'drawing';
}

// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
export type ActiveMapItemConfiguration = Gb2WmsMapItemConfiguration | DrawingLayerTestConfiguration;

export class ActiveMapItem<T extends ActiveMapItemConfiguration = ActiveMapItemConfiguration>
  implements HasLoadingState, HasVisibility, HasViewProcessState, IsImmerable
{
  public readonly id: string;
  public readonly title: string;
  public readonly mapImageUrl: string;
  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';
  public visible: boolean;
  public opacity: number;
  public readonly [immerable] = true;
  public readonly configuration: T;
  public readonly isSingleLayer: boolean;

  constructor(
    id: string,
    title: string,
    configuration: T,
    icon: string,
    hasSublayers: boolean = false,
    visible?: boolean,
    opacity?: number
  ) {
    this.id = id;
    this.title = title;
    this.configuration = configuration;
    this.isSingleLayer = hasSublayers;
    this.mapImageUrl = icon;
    this.visible = visible ?? true;
    this.opacity = opacity ?? 1;
  }
}
