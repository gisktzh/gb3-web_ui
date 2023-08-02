import {LoadingState} from '../../../shared/types/loading-state';
import {selectFeatureInfoQueryLoadingState} from './feature-info-query-loading-state.selector';

describe('selectFeatureInfoQueryLoadingState', () => {
  let featureInfoLoadingStateMock: LoadingState;
  let generalInfoLoadingStateMock: LoadingState;

  describe('error', () => {
    it('returns an error if featureInfo fails', () => {
      featureInfoLoadingStateMock = 'error';
      generalInfoLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('error');
    });

    it('returns an error if generalInfo fails', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'error';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('error');
    });
  });

  describe('loading', () => {
    it('returns loading if featureInfo is still loading', () => {
      featureInfoLoadingStateMock = 'loading';
      generalInfoLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('loading');
    });

    it('returns loading if generalInfo is still loading', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loading';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('loading');
    });
  });

  describe('loaded and undefined handling', () => {
    it('returns loaded if both have loaded', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('loaded');
    });

    it('returns undefined if both are undefined (initial state)', () => {
      featureInfoLoadingStateMock = 'undefined';
      generalInfoLoadingStateMock = 'undefined';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('undefined');
    });

    it('returns undefined if either one is undefined and one is loaded (hypothetical state)', () => {
      featureInfoLoadingStateMock = 'undefined';
      generalInfoLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(featureInfoLoadingStateMock, generalInfoLoadingStateMock);

      expect(actual).toEqual('undefined');
    });
  });
});
