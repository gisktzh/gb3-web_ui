import {createFeature, createReducer, on} from '@ngrx/store';
import {FeatureInfoActions} from '../actions/feature-info.actions';

export const featureInfoFeatureKey = 'featureInfo';

export interface FeatureInfoState {
  loadingState: 'loading' | 'loaded' | undefined;
}

export const initialState: FeatureInfoState = {
  loadingState: undefined
};

export const featureInfoFeature = createFeature({
  name: featureInfoFeatureKey,
  reducer: createReducer(
    initialState,
    on(FeatureInfoActions.sendRequest, (state, {x, y}): FeatureInfoState => {
      return {...state, loadingState: 'loading'};
    }),
    on(FeatureInfoActions.clearFeatureInfoContent, (state): FeatureInfoState => {
      return {...state, loadingState: undefined};
    })
  )
});

export const {name, reducer, selectFeatureInfoState, selectLoadingState} = featureInfoFeature;
