import {initialState, reducer} from './auth-status.reducer';
import {AuthStatusState} from '../states/auth-status.state';
import {AuthStatusActions} from '../actions/auth-status.actions';

describe('auth status reducer', () => {
  let existingState: AuthStatusState;

  beforeEach(() => {
    existingState = {
      isInitialDataLoaded: true,
      accessToken: 'mellon',
      userName: 'Gandalf',
      isAuthenticated: true,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setInitialDataLoaded', () => {
    it('sets isInitialDataLoaded to true; keeps everything else', () => {
      existingState.isInitialDataLoaded = false;

      const action = AuthStatusActions.setInitialDataLoaded();
      const state = reducer(existingState, action);

      expect(state.isInitialDataLoaded).toBe(true);
      expect(state.accessToken).toBe(existingState.accessToken);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogin', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogin();
      const state = reducer(existingState, action);

      expect(state.isInitialDataLoaded).toBe(existingState.isInitialDataLoaded);
      expect(state.accessToken).toBe(existingState.accessToken);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogin', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogin();
      const state = reducer(existingState, action);

      expect(state.isInitialDataLoaded).toBe(existingState.isInitialDataLoaded);
      expect(state.accessToken).toBe(existingState.accessToken);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogout', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogout({isForced: false});
      const state = reducer(existingState, action);

      expect(state.isInitialDataLoaded).toBe(existingState.isInitialDataLoaded);
      expect(state.accessToken).toBe(existingState.accessToken);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('setStatus', () => {
    it('sets isAuthenticated, accessToken and userName; keeps everything else', () => {
      const isAuthenticated = false;
      const accessToken = 'You shall not pass';
      const userName = 'Balrog';

      const action = AuthStatusActions.setStatus({isAuthenticated, accessToken, userName});
      const state = reducer(existingState, action);

      expect(state.isInitialDataLoaded).toBe(existingState.isInitialDataLoaded);
      expect(state.accessToken).toBe(accessToken);
      expect(state.userName).toBe(userName);
      expect(state.isAuthenticated).toBe(isAuthenticated);
    });
  });
});
