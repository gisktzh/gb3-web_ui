import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {DayjsTimeService} from '../../shared/services/dayjs-time.service';

export class ActiveTimeSliderLayersUtils {
  /**
   * Is the given layer visible? Returns `true` or `false` depending on the layer to be within the given time extent; or `undefined` if
   * either the layer isn't part of a time slider configuration, the extent is undefined or the configuration source isn't of type `layer`.
   */
  public static isLayerVisible(
    mapLayer: MapLayer,
    timeSliderConfiguration: TimeSliderConfiguration | undefined,
    timeExtent: TimeExtent | undefined,
  ): boolean | undefined {
    if (!timeSliderConfiguration || timeSliderConfiguration.sourceType === 'parameter' || !timeExtent) {
      return undefined;
    }

    const timeSliderLayerSource = timeSliderConfiguration.source as TimeSliderLayerSource;
    const timeSliderLayer = timeSliderLayerSource.layers.find((layer) => layer.layerName === mapLayer.layer);
    if (timeSliderLayer) {
      const date = DayjsTimeService.parseUTCDate(timeSliderLayer.date, timeSliderConfiguration.dateFormat);
      return date >= timeExtent.start && date < timeExtent.end;
    } else {
      return undefined;
    }
  }
}
