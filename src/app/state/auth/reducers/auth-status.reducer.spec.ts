import {initialState, reducer} from './auth-status.reducer';
import {AuthStatusState} from '../states/auth-status.state';
import {AuthStatusActions} from '../actions/auth-status.actions';

describe('auth status reducer', () => {
  let existingState: AuthStatusState;

  beforeEach(() => {
    existingState = {
      isAuthenticationInitialized: true,
      userName: 'Gandalf',
      userEmail: 'olórin@valinor.aman',
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

  describe('athenticationInitialized', () => {
    it('sets isAuthenticationInitialized to true; keeps everything else', () => {
      existingState.isAuthenticationInitialized = false;

      const action = AuthStatusActions.setInitialDataLoaded();
      const state = reducer(existingState, action);

      expect(state.isAuthenticationInitialized).toBe(true);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogin', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogin();
      const state = reducer(existingState, action);

      expect(state.isAuthenticationInitialized).toBe(existingState.isAuthenticationInitialized);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogin', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogin();
      const state = reducer(existingState, action);

      expect(state.isAuthenticationInitialized).toBe(existingState.isAuthenticationInitialized);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('performLogout', () => {
    it('keeps everything as it is', () => {
      const action = AuthStatusActions.performLogout({isForced: false});
      const state = reducer(existingState, action);

      expect(state.isAuthenticationInitialized).toBe(existingState.isAuthenticationInitialized);
      expect(state.userName).toBe(existingState.userName);
      expect(state.isAuthenticated).toBe(existingState.isAuthenticated);
    });
  });

  describe('setStatus', () => {
    it('sets isAuthenticated, accessToken and userName; keeps everything else', () => {
      const isAuthenticated = false;
      const userName = 'Balrog';

      const action = AuthStatusActions.setStatus({isAuthenticated, userName});
      const state = reducer(existingState, action);

      expect(state.isAuthenticationInitialized).toBe(existingState.isAuthenticationInitialized);
      expect(state.userName).toBe(userName);
      expect(state.isAuthenticated).toBe(isAuthenticated);
    });
  });
});
