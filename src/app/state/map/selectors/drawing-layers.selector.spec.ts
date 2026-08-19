import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectFeatureInfoQueryLoadingState} from './feature-info-query-loading-state.selector';

describe('selectFeatureInfoQueryLoadingState', () => {
  let featureInfoLoadingStateMock: LoadingState;
  let generalInfoLoadingStateMock: LoadingState;
  let oerebExtractLoadingStateMock: LoadingState;

  describe('error', () => {
    it('returns an error if featureInfo fails', () => {
      featureInfoLoadingStateMock = 'error';
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('error');
    });

    it('returns an error if generalInfo fails', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'error';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('error');
    });

    it('returns an error if oerebExtract fails', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'error';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('error');
    });
  });

  describe('loading', () => {
    it('returns loading if featureInfo is still loading', () => {
      featureInfoLoadingStateMock = 'loading';
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('loading');
    });

    it('returns loading if generalInfo is still loading', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loading';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('loading');
    });

    it('returns loading if oerebExtract is still loading', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'loading';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('loading');
    });
  });

  describe('loaded and undefined handling', () => {
    it('returns loaded if all three have loaded', () => {
      featureInfoLoadingStateMock = 'loaded';
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual('loaded');
    });

    it('returns undefined if all three are undefined (initial state)', () => {
      featureInfoLoadingStateMock = undefined;
      generalInfoLoadingStateMock = undefined;
      oerebExtractLoadingStateMock = undefined;

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual(undefined);
    });

    it('returns undefined if either one is undefined and one is loaded (hypothetical state)', () => {
      featureInfoLoadingStateMock = undefined;
      generalInfoLoadingStateMock = 'loaded';
      oerebExtractLoadingStateMock = 'loaded';

      const actual = selectFeatureInfoQueryLoadingState.projector(
        featureInfoLoadingStateMock,
        generalInfoLoadingStateMock,
        oerebExtractLoadingStateMock,
      );

      expect(actual).toEqual(undefined);
    });
  });
});
