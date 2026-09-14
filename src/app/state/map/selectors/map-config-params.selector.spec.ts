import {selectMapPageParams} from './map-config-params.selector';

describe('mapConfigParamsSelector', () => {
  describe('selectMapPageParams', () => {
    it('adds the ordered topic ids to the map config params', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};

      const actual = selectMapPageParams.projector(mapConfigParams, undefined, ['first', 'second']);

      expect(actual).toEqual({...mapConfigParams, topics: 'first,second'});
    });

    it('uses null to remove the topics parameter when no topic is active', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};

      const actual = selectMapPageParams.projector(mapConfigParams, undefined, []);

      expect(actual).toEqual({...mapConfigParams, topics: null});
    });

    it('keeps requested topics while deep-link initialization is pending', () => {
      const mapConfigParams = {x: 1, y: 2, scale: 3, basemap: 'base'};

      const actual = selectMapPageParams.projector(mapConfigParams, ['requested'], []);

      expect(actual).toEqual({...mapConfigParams, topics: 'requested'});
    });
  });
});
