import {LoadingState} from '../../shared/types/loading-state';
import {AttributeFilterConfiguration, Map, MapLayer, TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {HasLoadingState} from '../../shared/interfaces/has-loading-state.interface';
import {HasVisibility} from '../../shared/interfaces/has-visibility.interface';
import {HasViewProcessState} from '../../shared/interfaces/has-view-process-state.interface';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {TimeSliderExtent} from '../interfaces/time-slider-extent.interface';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import {Duration} from 'dayjs/plugin/duration';

dayjs.extend(duration);

export class ActiveMapItem implements HasLoadingState, HasVisibility, HasViewProcessState {
  public readonly id: string;
  public readonly title: string;
  public readonly url: string;
  public readonly mapImageUrl: string;
  public readonly timeSliderConfiguration?: TimeSliderConfiguration;
  public readonly filterConfigurations?: AttributeFilterConfiguration[];

  public readonly mapId: string;
  public readonly layers: MapLayer[];
  public readonly isSingleLayer: boolean;

  public loadingState: LoadingState = 'undefined';
  public viewProcessState: ViewProcessState = 'undefined';
  public visible = true;
  public opacity = 1;
  public timeSliderExtent?: TimeSliderExtent;

  constructor(map: Map, layer?: MapLayer) {
    this.isSingleLayer = !!layer;
    this.id = layer ? `${map.id}_${layer.layer}` : map.id;
    this.title = layer ? layer.title : map.title;
    this.url = map.wmsUrl;
    this.mapImageUrl = map.icon;
    this.mapId = map.id;
    this.layers = layer ? [layer] : map.layers;
    this.timeSliderConfiguration = map.timeSliderConfiguration;
    if (map.timeSliderConfiguration) {
      this.timeSliderExtent = ActiveMapItem.createInitialTimeExtent(map.timeSliderConfiguration);
    }
    this.filterConfigurations = map.filterConfigurations;
  }

  public static createInitialTimeExtent(timeSliderConfig: TimeSliderConfiguration): TimeSliderExtent {
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const range: Duration | null = timeSliderConfig.range ? dayjs.duration(timeSliderConfig.range) : null;
    return {
      start: minimumDate,
      end: range ? dayjs(minimumDate).add(range).toDate() : maximumDate
    };
  }
}
