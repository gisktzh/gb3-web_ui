import {initialState, reducer} from './feature-info.reducer';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {FeatureInfoState} from '../states/feature-info.state';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {FeatureInfoQueryLocation, FeatureInfoResponse, FeatureInfoResult} from '../../../shared/interfaces/feature-info.interface';

describe('FeatureInfo Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('clearContent', () => {
    it('resets the current state to initial state', () => {
      const action = FeatureInfoActions.clearContent();
      const mockCurrentState: FeatureInfoState = {
        queryLocation: {y: 0, x: 5555},
        loadingState: 'loading',
        data: [{topic: 'Gimli, the best dwarf', layers: [], isSingleLayer: false}],
        pinnedFeatureId: 'Moria best cave',
        highlightedFeature: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const result = reducer(mockCurrentState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('setError', () => {
    it('sets loadingState to error', () => {
      const action = FeatureInfoActions.setError({});

      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('error');
      expect(result.highlightedFeature).toEqual(initialState.highlightedFeature);
      expect(result.pinnedFeatureId).toEqual(initialState.pinnedFeatureId);
      expect(result.data).toEqual(initialState.data);
      expect(result.queryLocation).toEqual(initialState.queryLocation);
    });
  });

  describe('clearHighlight', () => {
    it('removes the highlight only, but leaves state untouched otherwise', () => {
      const action = FeatureInfoActions.clearHighlight();
      const mockCurrentState: FeatureInfoState = {
        queryLocation: {y: 0, x: 5555},
        loadingState: 'loading',
        data: [{topic: 'Gimli, the best dwarf', layers: [], isSingleLayer: false}],
        pinnedFeatureId: 'Moria best cave',
        highlightedFeature: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const result = reducer(mockCurrentState, action);

      expect(result.highlightedFeature).toEqual(initialState.highlightedFeature);
      expect(result.pinnedFeatureId).toEqual(initialState.pinnedFeatureId);
      expect(result.loadingState).toEqual(mockCurrentState.loadingState);
      expect(result.data).toEqual(mockCurrentState.data);
      expect(result.queryLocation).toEqual(mockCurrentState.queryLocation);
    });
  });

  describe('highlightFeature', () => {
    it('adds the new highlight only, but leaves state untouched otherwise', () => {
      const newHighlightedFeature: GeometryWithSrs = {type: 'Polygon', srs: 2056, coordinates: [[[44, 22]]]};
      const newHighlightedFeatureId = 'xyz';
      const action = FeatureInfoActions.highlightFeature({pinnedFeatureId: newHighlightedFeatureId, feature: newHighlightedFeature});
      const mockCurrentState: FeatureInfoState = {
        queryLocation: {y: 0, x: 5555},
        loadingState: 'loading',
        data: [{topic: 'Gimli, the best dwarf', layers: [], isSingleLayer: false}],
        pinnedFeatureId: 'Moria best cave',
        highlightedFeature: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const result = reducer(mockCurrentState, action);

      expect(result.highlightedFeature).toEqual(newHighlightedFeature);
      expect(result.pinnedFeatureId).toEqual(newHighlightedFeatureId);
      expect(result.loadingState).toEqual(mockCurrentState.loadingState);
      expect(result.data).toEqual(mockCurrentState.data);
      expect(result.queryLocation).toEqual(mockCurrentState.queryLocation);
    });
  });

  describe('updateContent', () => {
    it('updates the state with new content and sets the loading state, nothing else', () => {
      const featureInfos: FeatureInfoResponse[] = [
        {
          featureInfo: {
            x: 1,
            y: 2,
            results: {
              topic: 'Topic1',
              layers: [{layer: 'test', title: 'title', features: [], metaDataLink: 'url2'}],
              metaDataLink: 'url',
              isSingleLayer: false,
            },
          },
        },
      ];
      const action = FeatureInfoActions.updateContent({featureInfos});
      const expected: FeatureInfoResult[] = featureInfos.map((featureInfo) => featureInfo.featureInfo.results);

      const result = reducer(initialState, action);

      expect(result.data).toEqual(expected);
      expect(result.loadingState).toEqual('loaded');
      expect(result.pinnedFeatureId).toEqual(initialState.pinnedFeatureId);
      expect(result.highlightedFeature).toEqual(initialState.highlightedFeature);
      expect(result.queryLocation).toEqual(initialState.queryLocation);
    });
  });

  describe('sendRequest', () => {
    it('resets the current state to initial state, sets the location and loadingstate', () => {
      const location: FeatureInfoQueryLocation = {x: 1337, y: 42};
      const action = FeatureInfoActions.sendRequest({x: location.x!, y: location.y!});
      const mockCurrentState: FeatureInfoState = {
        queryLocation: {y: 0, x: 5555},
        loadingState: 'loaded',
        data: [{topic: 'Gimli, the best dwarf', layers: [], isSingleLayer: false}],
        pinnedFeatureId: 'Moria best cave',
        highlightedFeature: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const result = reducer(mockCurrentState, action);

      expect(result.queryLocation).toEqual(location);
      expect(result.loadingState).toEqual('loading');
      expect(result.data).toEqual(initialState.data);
      expect(result.pinnedFeatureId).toEqual(initialState.pinnedFeatureId);
      expect(result.highlightedFeature).toEqual(initialState.highlightedFeature);
    });
  });
});
