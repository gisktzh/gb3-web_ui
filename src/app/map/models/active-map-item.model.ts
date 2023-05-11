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

export class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState, IsImmerable {
  public readonly id: string;
  public readonly title: string;
  public readonly url: string;
  public readonly mapImageUrl: string;
  public readonly timeSliderConfiguration?: TimeSliderConfiguration;
  public readonly filterConfigurations?: FilterConfiguration[];
  public readonly searchConfigurations?: SearchConfiguration[];
  public readonly mapId: string;
  public readonly layers: MapLayer[];
  public readonly isSingleLayer: boolean;
  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';
  public visible: boolean;
  public opacity: number;
  public timeSliderExtent?: TimeExtent;
  public readonly [immerable] = true;

  constructor(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number) {
    this.isSingleLayer = !!layer;
    this.id = layer ? ActiveMapItem.createSingleLayerId(map.id, layer.layer) : map.id;
    this.title = layer ? layer.title : map.title;
    this.url = map.wmsUrl;
    this.mapImageUrl = map.icon;
    this.mapId = map.id;
    this.layers = layer ? [layer] : map.layers;
    this.visible = visible ?? true;
    this.opacity = opacity ?? 1;
    this.timeSliderConfiguration = map.timeSliderConfiguration;
    if (map.timeSliderConfiguration) {
      this.timeSliderExtent = TimeExtentUtils.createInitialTimeSliderExtent(map.timeSliderConfiguration);
    }
    this.filterConfigurations = map.filterConfigurations;
    this.searchConfigurations = map.searchConfigurations;
  }

  public static createSingleLayerId(mapId: string, layerId: string): string {
    return `${mapId}_${layerId}`;
  }
}
