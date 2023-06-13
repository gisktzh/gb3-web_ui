import {createFeature, createReducer, on} from '@ngrx/store';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {FeatureInfoState} from '../states/feature-info.state';

export const featureInfoFeatureKey = 'featureInfo';

export const initialState: FeatureInfoState = {
  loadingState: 'undefined',
  data: [],
  highlightedFeature: undefined,
  pinnedFeatureId: undefined
};

export const featureInfoFeature = createFeature({
  name: featureInfoFeatureKey,
  reducer: createReducer(
    initialState,
    on(FeatureInfoActions.sendRequest, (): FeatureInfoState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(FeatureInfoActions.clearContent, (): FeatureInfoState => {
      return {...initialState};
    }),
    on(FeatureInfoActions.updateContent, (state, {featureInfos}): FeatureInfoState => {
      const data = featureInfos.map((featureInfo) => featureInfo.featureInfo.results);
      return {...state, loadingState: 'loaded', data};
    }),
    on(FeatureInfoActions.highlightFeature, (state, {feature, pinnedFeatureId}): FeatureInfoState => {
      return {...state, highlightedFeature: feature, pinnedFeatureId};
    }),
    on(FeatureInfoActions.clearHighlight, (state): FeatureInfoState => {
      return {...state, highlightedFeature: undefined, pinnedFeatureId: undefined};
    })
  )
});

export const {name, reducer, selectFeatureInfoState, selectLoadingState, selectData, selectHighlightedFeature, selectPinnedFeatureId} =
  featureInfoFeature;
