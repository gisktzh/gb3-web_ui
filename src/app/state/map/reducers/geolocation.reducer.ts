import {createFeature, createReducer, on} from '@ngrx/store';
import {GeolocationState} from '../states/geolocation.state';
import {GeolocationActions} from '../actions/geolocation.actions';

const GEOLOCATION_ERRORS = new Map<number, string>([
  [GeolocationPositionError.TIMEOUT, 'Die Berechtiungsanfrage hat das Zeitlimit überschritten.'],
  [GeolocationPositionError.PERMISSION_DENIED, 'Die Berechtiungsanfrage wurde abgelehnt.'],
  [GeolocationPositionError.POSITION_UNAVAILABLE, 'Die Position konnte nicht korrekt eruiert werden.']
]);

export const geolocationFeatureConfigKey = 'geolocation';

export const initialState: GeolocationState = {
  loadingState: 'undefined',
  errorReason: undefined,
  currentGpsLocation: undefined
};

export const geolocationFeature = createFeature({
  name: geolocationFeatureConfigKey,
  reducer: createReducer(
    initialState,
    on(GeolocationActions.startLocationRequest, (): GeolocationState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(GeolocationActions.setGeolocation, (state, {location}): GeolocationState => {
      return {...initialState, loadingState: 'loaded', currentGpsLocation: location};
    }),
    on(GeolocationActions.setFailure, (state, {error}): GeolocationState => {
      return {loadingState: 'error', errorReason: GEOLOCATION_ERRORS.get(error.code), currentGpsLocation: undefined};
    })
  )
});

export const {name, reducer, selectGeolocationState, selectLoadingState, selectErrorReason, selectCurrentGpsLocation} = geolocationFeature;
