import {initialState, reducer} from './elevation-profile.reducer';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileState} from '../states/elevation-profile.state';

describe('ElevationProfile Reducer', () => {
  const mockData: ElevationProfileData = {
    dataPoints: [{altitude: 1, distance: 250, x: 2600000, y: 1200000}],
    statistics: {groundDistance: 666, linearDistance: 42, elevationDifference: 1337, lowestPoint: 9000, highestPoint: 9001},
    csvRequest: {url: '', params: new URLSearchParams()},
  };

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadProfile', () => {
    it('sets the loading state', () => {
      const action = ElevationProfileActions.loadProfile({geometry: MinimalGeometriesUtils.getMinimalLineString(2056)});

      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('loading');
      expect(result.data).toEqual(initialState.data);
    });
  });

  describe('updateContent', () => {
    it('sets the loading state and returned data', () => {
      const action = ElevationProfileActions.setProfile({data: mockData});

      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('loaded');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('setError', () => {
    it('sets the loading state and returned data', () => {
      const action = ElevationProfileActions.setProfileError({});

      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('error');
      expect(result.data).toEqual(initialState.data);
    });
  });

  describe('clearProfile', () => {
    it('resets the internal state', () => {
      const action = ElevationProfileActions.clearProfile();
      const mockState: ElevationProfileState = {
        data: mockData,
        loadingState: 'loaded',
      };

      const result = reducer(mockState, action);

      expect(result).toEqual(initialState);
    });
  });
});
