import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import dayjs from 'dayjs';
import {TimeExtent} from '../interfaces/time-extent.interface';

export class ActiveTimeSliderLayersUtils {
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
      const date = dayjs(timeSliderLayer.date, timeSliderConfiguration.dateFormat).toDate();
      return date >= timeExtent.start && date < timeExtent.end;
    } else {
      return undefined;
    }
  }
}
