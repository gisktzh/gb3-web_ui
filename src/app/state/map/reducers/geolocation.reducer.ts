import {createFeature, createReducer, on} from '@ngrx/store';
import {GeolocationState} from '../states/geolocation.state';
import {GeolocationActions} from '../actions/geolocation.actions';

export const geolocationFeatureConfigKey = 'geolocation';

export const initialState: GeolocationState = {
  loadingState: 'undefined',
  errorReason: undefined
};

export const geolocationFeature = createFeature({
  name: geolocationFeatureConfigKey,
  reducer: createReducer(
    initialState,
    on(GeolocationActions.startLocationRequest, (): GeolocationState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(GeolocationActions.setSuccess, (): GeolocationState => {
      return {...initialState, loadingState: 'loaded'};
    })
  )
});

export const {name, reducer, selectGeolocationState, selectLoadingState, selectErrorReason} = geolocationFeature;
