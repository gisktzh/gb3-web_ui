import {createFeature, createReducer, on} from '@ngrx/store';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthStatusState} from '../states/auth-status.state';

export const authStatusFeatureKey = 'authStatus';

export const initialState: AuthStatusState = {
  isInitialDataLoaded: false,
  isAuthenticated: false,
  userName: undefined,
  accessToken: undefined,
};

export const authStatusFeature = createFeature({
  name: authStatusFeatureKey,
  reducer: createReducer(
    initialState,
    on(AuthStatusActions.setInitialDataLoaded, (state) => {
      return {...state, isInitialDataLoaded: true};
    }),
    on(AuthStatusActions.performLogin, (state) => {
      return state;
    }),
    on(AuthStatusActions.performLogin, (state) => {
      return state;
    }),
    on(AuthStatusActions.performLogout, (state) => {
      return state;
    }),
    on(AuthStatusActions.setStatus, (state, {isAuthenticated, accessToken, userName}): AuthStatusState => {
      return {...state, isAuthenticated, accessToken, userName};
    }),
  ),
});

export const {name, reducer, selectAuthStatusState, selectIsAuthenticated, selectUserName, selectAccessToken, selectIsInitialDataLoaded} =
  authStatusFeature;
