import {createFeature, createReducer, on} from '@ngrx/store';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthStatusState} from '../states/auth-status.state';

export const authStatusFeatureKey = 'authStatus';

export const initialState: AuthStatusState = {
  isAuthenticated: false,
  userName: undefined,
};

export const authStatusFeature = createFeature({
  name: authStatusFeatureKey,
  reducer: createReducer(
    initialState,
    on(AuthStatusActions.setStatus, (state, {isAuthenticated, userName}): AuthStatusState => {
      return {...state, isAuthenticated, userName};
    }),
  ),
});

export const {name, reducer, selectAuthStatusState, selectIsAuthenticated, selectUserName} = authStatusFeature;
