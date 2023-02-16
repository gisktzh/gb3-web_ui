import {createFeature, createReducer, on} from '@ngrx/store';
import {AuthStatusActions} from '../actions/auth-status.actions';

export const authStatusFeatureKey = 'authStatus';

export interface AuthStatusState {
  isAuthenticated: boolean;
}

export const initialState: AuthStatusState = {
  isAuthenticated: false
};

export const authStatusFeature = createFeature({
  name: authStatusFeatureKey,
  reducer: createReducer(
    initialState,
    on(AuthStatusActions.setStatus, (state, {isAuthenticated}): AuthStatusState => {
      return {...state, isAuthenticated};
    })
  )
});

export const {name, reducer, selectAuthStatusState, selectIsAuthenticated} = authStatusFeature;
