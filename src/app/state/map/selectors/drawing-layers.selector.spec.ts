import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectFeatureInfoQueryLoadingState} from './feature-info-query-loading-state.selector';

describe('selectFeatureInfoQueryLoadingState', () => {
  describe('projection', () => {
    it.each([
      {featureInfo: 'error', generalInfo: 'loaded', oerebExtract: 'loaded', expected: 'error'},
      {featureInfo: 'loaded', generalInfo: 'error', oerebExtract: 'loaded', expected: 'error'},
      {featureInfo: 'loaded', generalInfo: 'loaded', oerebExtract: 'error', expected: 'error'},
      {featureInfo: 'loading', generalInfo: 'loaded', oerebExtract: 'loaded', expected: 'loading'},
      {featureInfo: 'loaded', generalInfo: 'loading', oerebExtract: 'loaded', expected: 'loading'},
      {featureInfo: 'loaded', generalInfo: 'loaded', oerebExtract: 'loading', expected: 'loading'},
      {featureInfo: 'loaded', generalInfo: 'loaded', oerebExtract: 'loaded', expected: 'loaded'},
      {featureInfo: undefined, generalInfo: undefined, oerebExtract: undefined, expected: undefined},
      {featureInfo: undefined, generalInfo: 'loaded', oerebExtract: 'loaded', expected: undefined},
    ] as {featureInfo: LoadingState; generalInfo: LoadingState; oerebExtract: LoadingState; expected: LoadingState}[])(
      'correctly projects to $expected with $featureInfo, $generalInfo and $oerebExtract',
      ({featureInfo, generalInfo, oerebExtract, expected}) => {
        const actual = selectFeatureInfoQueryLoadingState.projector(featureInfo, generalInfo, oerebExtract);

        expect(actual).toEqual(expected);
      },
    );
  });
});
