import {createFeature, createReducer, on} from '@ngrx/store';
import {AppActions} from '../actions/app.actions';
import {AppState} from '../states/app.state';

export const appFeatureKey = 'app';

export const initialState: AppState = {
  devMode: false,
  dynamicInternalUrlsConfiguration: {geolion: {href: ''}},
  accessMode: 'internet',
};

export const appFeature = createFeature({
  name: appFeatureKey,
  reducer: createReducer(
    initialState,
    on(AppActions.activateDevMode, (state): AppState => {
      return {...state, devMode: true};
    }),
    on(AppActions.setDynamicInternalUrlConfiguration, (state, {dynamicInternalUrlsConfiguration}): AppState => {
      return {...state, dynamicInternalUrlsConfiguration};
    }),
    on(AppActions.setAccessMode, (state, {accessMode}): AppState => {
      return {...state, accessMode};
    }),
  ),
});

export const {name, reducer, selectAppState, selectDevMode, selectDynamicInternalUrlsConfiguration, selectAccessMode} = appFeature;
