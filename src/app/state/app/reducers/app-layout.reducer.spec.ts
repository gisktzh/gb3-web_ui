import {AppLayoutActions} from '../actions/app-layout.actions';
import {AppLayoutState} from '../states/app-layout.state';
import {initialState, reducer} from './app-layout.reducer';

describe('AppLayout Reducer', () => {
  let existingState: AppLayoutState;

  beforeEach(() => {
    existingState = {
      scrollbarWidth: undefined,
      screenMode: 'regular',
      screenHeight: 'regular',
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setScreenMode', () => {
    it('sets the screenMode to mobile and screenHeight to small', () => {
      const screenMode = 'mobile';
      const screenHeight = 'small';
      const action = AppLayoutActions.setScreenMode({screenMode, screenHeight});
      const state = reducer(existingState, action);

      expect(state.screenMode).toBe(screenMode);
      expect(state.screenHeight).toBe(screenHeight);
      expect(state.scrollbarWidth).toBe(existingState.scrollbarWidth);
    });
  });

  describe('setScrollbarwidth', () => {
    it('sets the scrollbarWidth on the first time it is called', () => {
      const scrollbarWidth = 14;
      const action = AppLayoutActions.setScrollbarWidth({scrollbarWidth});
      const state = reducer(existingState, action);

      expect(state.scrollbarWidth).toBe(scrollbarWidth);
      expect(state.screenMode).toBe(existingState.screenMode);
      expect(state.screenHeight).toBe(existingState.screenHeight);
    });
    it('does not set the scrollbarWidth after it has been set', () => {
      const scrollbarWidth = 16;
      const action = AppLayoutActions.setScrollbarWidth({scrollbarWidth});
      const state = reducer({...existingState, scrollbarWidth: 14}, action);

      expect(state.scrollbarWidth).toBe(14);
      expect(state.screenMode).toBe(existingState.screenMode);
      expect(state.screenHeight).toBe(existingState.screenHeight);
    });
  });
});
