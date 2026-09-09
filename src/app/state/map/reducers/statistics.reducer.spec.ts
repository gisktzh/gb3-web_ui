import {initialState, reducer} from './statistics.reducer';
import {StatisticsActions} from '../actions/statistics.actions';
import {StatisticsState} from '../states/statistics.state';
import {PolygonWithSrs, PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';

describe('statistics reducer', () => {
  const center: PointWithSrs = {type: 'Point', coordinates: [2683000, 1247000], srs: 2056};
  const geometry: PolygonWithSrs = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ],
    ],
    srs: 2056,
  };
  const results: StatisticsResult[] = [{topic: 'topic', title: 'Topic', layers: []}];

  describe('setSelection', () => {
    it('stores the area and invalidates results loaded for the previous one', () => {
      const state: StatisticsState = {...initialState, loadingState: 'loaded', data: results};

      const result = reducer(state, StatisticsActions.setSelection({geometry, center, radiusInMeters: undefined, isUserDefined: true}));

      expect(result.geometry).toEqual(geometry);
      expect(result.center).toEqual(center);
      expect(result.isUserDefined).toBe(true);
      expect(result.loadingState).toBeUndefined();
      expect(result.data).toEqual([]);
    });

    it('keeps the current radius if the selection does not dictate one', () => {
      const state: StatisticsState = {...initialState, radiusInMeters: 750};

      const result = reducer(state, StatisticsActions.setSelection({geometry, center, radiusInMeters: undefined, isUserDefined: true}));

      expect(result.radiusInMeters).toBe(750);
    });

    it('takes over the radius of a drawn circle', () => {
      const result = reducer(initialState, StatisticsActions.setSelection({geometry, center, radiusInMeters: 1200, isUserDefined: true}));

      expect(result.radiusInMeters).toBe(1200);
    });
  });

  describe('setRadius', () => {
    it('marks the area as user defined so that it survives a tab switch', () => {
      const result = reducer(initialState, StatisticsActions.setRadius({radiusInMeters: 250}));

      expect(result.radiusInMeters).toBe(250);
      expect(result.isUserDefined).toBe(true);
    });
  });

  describe('clearContent', () => {
    it('resets the results but keeps the mode and the radius as user settings', () => {
      const state: StatisticsState = {
        ...initialState,
        mode: 'polygon',
        radiusInMeters: 900,
        geometry,
        center,
        loadingState: 'loaded',
        data: results,
      };

      const result = reducer(state, StatisticsActions.clearContent());

      expect(result.mode).toBe('polygon');
      expect(result.radiusInMeters).toBe(900);
      expect(result.geometry).toBeUndefined();
      expect(result.data).toEqual([]);
      expect(result.loadingState).toBeUndefined();
    });
  });

  describe('updateContent', () => {
    it('stores the results', () => {
      const result = reducer({...initialState, loadingState: 'loading'}, StatisticsActions.updateContent({results}));

      expect(result.loadingState).toBe('loaded');
      expect(result.data).toEqual(results);
    });
  });

  describe('setError', () => {
    it('discards stale results', () => {
      const state: StatisticsState = {...initialState, loadingState: 'loading', data: results};

      const result = reducer(state, StatisticsActions.setError({}));

      expect(result.loadingState).toBe('error');
      expect(result.data).toEqual([]);
    });
  });
});
