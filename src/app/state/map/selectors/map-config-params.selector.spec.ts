import {selectMapPageParams} from './map-config-params.selector';
import {defaultMapConfig} from '../../../shared/configs/map.config';

describe('mapConfigParamsSelector', () => {
  describe('selectMapPageParams', () => {
    it('adds the ordered topic ids to the map config params', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};

      const actual = selectMapPageParams.projector(mapConfigParams, defaultMapConfig, ['first', 'second']);

      expect(actual).toEqual({...mapConfigParams, topics: 'first,second'});
    });

    it('uses null to remove the topics parameter when no topic is active', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};

      const actual = selectMapPageParams.projector(mapConfigParams, defaultMapConfig, []);

      expect(actual).toEqual({...mapConfigParams, topics: null});
    });

    it('keeps requested topics while deep-link initialization is pending', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};
      const mapConfigState = {...defaultMapConfig, initialMaps: ['requested'], initialMapsAreTopics: true};

      const actual = selectMapPageParams.projector(mapConfigParams, mapConfigState, []);

      expect(actual).toEqual({...mapConfigParams, topics: 'requested'});
    });
  });
});
