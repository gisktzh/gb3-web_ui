import {createFeature, createReducer, on} from '@ngrx/store';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {FeatureInfoResult} from '../../../../shared/models/gb3-api.interfaces';
import {LoadingState} from '../../../../shared/enums/loading-state';
import {Geometry} from 'geojson';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';

export const featureInfoFeatureKey = 'featureInfo';

export interface FeatureInfoState extends HasLoadingState {
  data: FeatureInfoResult[];
  highlightedFeature: Geometry | undefined;
}

export const initialState: FeatureInfoState = {
  loadingState: undefined,
  data: [],
  highlightedFeature: undefined
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
    }),
    on(FeatureInfoActions.highlightFeature, (state, {feature}): FeatureInfoState => {
      return {...state, highlightedFeature: feature};
    })
  )
});

export const {name, reducer, selectFeatureInfoState, selectLoadingState, selectData, selectHighlightedFeature} = featureInfoFeature;
