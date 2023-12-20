import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource, TimeSliderParameterSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {ActiveTimeSliderLayersUtils} from './active-time-slider-layers.utils';

describe('ActiveTimeSliderLayersUtils', () => {
  describe('isLayerVisible', () => {
    it('returns `true` if a given layer is within the time extent', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'layerName', date: '2023-06-30'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = true;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `false` if a given layer is outside the time extent', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'layerName', date: '2024-01-01'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = false;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if there is no matching layer', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'otherLayerName', date: '2023-06-15'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if it is not a layer based time slider configuration', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'parameter',
        source: {
          startRangeParameter: 'VON',
          endRangeParameter: 'BIS',
          layerIdentifiers: ['layerName'],
        } as TimeSliderParameterSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if the time slider configuration is undefined', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = undefined;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if the time extent is undefined', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'parameter',
        source: {
          startRangeParameter: 'VON',
          endRangeParameter: 'BIS',
          layerIdentifiers: ['layerName'],
        } as TimeSliderParameterSource,
      } as TimeSliderConfiguration;
      const timeExtent = undefined;

      const expected = undefined;
      const actual = ActiveTimeSliderLayersUtils.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });
  });
});
