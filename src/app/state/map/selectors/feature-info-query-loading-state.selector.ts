import {createSelector} from '@ngrx/store';
import {selectLoadingState as selectFeatureInfoLoadingState} from '../reducers/feature-info.reducer';
import {selectLoadingState as selectGeneralInfoLoadingState} from '../reducers/general-info.reducer';
import {selectLoadingState as selectOerebExtractLoadingState} from '../reducers/oereb-extract.reducer';
import {LoadingState} from '../../../shared/types/loading-state.type';

/**
 * This selector aggregates the loading state of both the FeatureInfo and the GeneralInfo into one LoadingState. The logic is as follows
 * (in order):
 *
 * * If either one of the queries has an error, we return an error; chances are that we do not show separate error states
 * * If either one of the queries is still loading, we show the loading state; we only show content once both are finished
 * * If either one of the queries is loaded, return loaded
 * * Else return undefined, which basically only happens as initial state
 */

export const selectFeatureInfoQueryLoadingState = createSelector<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- official Record type from ngrx
  Record<string, any>,
  LoadingState,
  LoadingState,
  LoadingState,
  LoadingState
>(
  selectFeatureInfoLoadingState,
  selectGeneralInfoLoadingState,
  selectOerebExtractLoadingState,
  (featureInfoLoadingState, generalInfoLoadingState, oerebExtractLoadingState) => {
    if (featureInfoLoadingState === 'error' || generalInfoLoadingState === 'error' || oerebExtractLoadingState === 'error') {
      return 'error';
    }

    if (featureInfoLoadingState === 'loading' || generalInfoLoadingState === 'loading' || oerebExtractLoadingState === 'loading') {
      return 'loading';
    }

    if (
      featureInfoLoadingState === 'loaded' &&
      generalInfoLoadingState === 'loaded' &&
      (oerebExtractLoadingState === 'loaded' || oerebExtractLoadingState === undefined)
    ) {
      return 'loaded';
    }

    return undefined;
  },
);
