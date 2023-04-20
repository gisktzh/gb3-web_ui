import {LoadingState} from '../../shared/types/loading-state';
import {FilterConfiguration, Map, MapLayer, TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';
import {HasViewProcessState} from '../../shared/interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TimeExtentUtils} from '../../shared/utils/time-extent.utils';

export class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState {
  public readonly id: string;
  public readonly title: string;
  public readonly url: string;
  public readonly mapImageUrl: string;
  public readonly timeSliderConfiguration?: TimeSliderConfiguration;
  public readonly filterConfigurations?: FilterConfiguration[];

  public readonly mapId: string;
  public readonly layers: MapLayer[];
  public readonly isSingleLayer: boolean;

  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';
  public visible: boolean;
  public opacity: number;
  public timeSliderExtent?: TimeExtent;

  constructor(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number) {
    this.isSingleLayer = !!layer;
    this.id = layer ? ActiveMapItem.getSingleLayerName(map.id, layer.layer) : map.id;
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
  }

  public static getSingleLayerName(mapId: string, layerId: string): string {
    return `${mapId}_${layerId}`;
  }
}
