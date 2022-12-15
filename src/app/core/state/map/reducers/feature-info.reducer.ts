import {createFeature, createReducer, on} from '@ngrx/store';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {FeatureInfoResult} from '../../../../shared/models/gb3-api.interfaces';
import {LoadingState} from '../../../../shared/enums/loading-state';

export const featureInfoFeatureKey = 'featureInfo';

export interface FeatureInfoState {
  loadingState: LoadingState | undefined;
  data: FeatureInfoResult[];
}

export const initialState: FeatureInfoState = {
  loadingState: undefined,
  data: []
};

export const featureInfoFeature = createFeature({
  name: featureInfoFeatureKey,
  reducer: createReducer(
    initialState,
    on(FeatureInfoActions.sendRequest, (): FeatureInfoState => {
      return {...initialState, loadingState: LoadingState.LOADING};
    }),
    on(FeatureInfoActions.clearFeatureInfoContent, (): FeatureInfoState => {
      return {...initialState};
    }),
    on(FeatureInfoActions.updateFeatureInfo, (state, {featureInfos}): FeatureInfoState => {
      const data = featureInfos.map((featureInfo) => featureInfo.featureInfo.results);
      return {...state, loadingState: LoadingState.LOADED, data};
    })
  )
});

export const {name, reducer, selectFeatureInfoState, selectLoadingState, selectData} = featureInfoFeature;
