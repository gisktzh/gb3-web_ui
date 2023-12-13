import {createFeature, createReducer, on} from '@ngrx/store';
import {ElevationProfileState} from '../states/elevation-profile.state';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';

export const elevationProfileFeatureKey = 'elevationProfile';

export const initialState: ElevationProfileState = {
  loadingState: undefined,
  data: undefined,
};

export const elevationProfileFeature = createFeature({
  name: elevationProfileFeatureKey,
  reducer: createReducer(
    initialState,
    on(ElevationProfileActions.loadProfile, (): ElevationProfileState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(ElevationProfileActions.setProfile, (_, {data}): ElevationProfileState => {
      return {...initialState, data, loadingState: 'loaded'};
    }),
    on(ElevationProfileActions.setProfileError, (): ElevationProfileState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(ElevationProfileActions.clearProfile, (): ElevationProfileState => {
      return {...initialState};
    }),
  ),
});

export const {name, reducer, selectElevationProfileState, selectLoadingState, selectData} = elevationProfileFeature;
