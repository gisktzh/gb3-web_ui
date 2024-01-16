import {createFeature, createReducer, on} from '@ngrx/store';
import {AppActions} from '../actions/app.actions';
import {AppState} from '../states/app.state';

export const appFeatureKey = 'app';

export const initialState: AppState = {
  devMode: false,
};

export const appFeature = createFeature({
  name: appFeatureKey,
  reducer: createReducer(
    initialState,
    on(AppActions.activateDevMode, (state): AppState => {
      return {...state, devMode: true};
    }),
  ),
});

export const {name, reducer, selectAppState, selectDevMode} = appFeature;
