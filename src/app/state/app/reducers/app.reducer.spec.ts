import {initialState, reducer} from './app.reducer';
import {AppState} from '../states/app.state';
import {AppActions} from '../actions/app.actions';

describe('App Reducer', () => {
  let existingState: AppState;

  beforeEach(() => {
    existingState = {
      devMode: false,
      dynamicInternalUrlsConfiguration: {
        geolion: {href: ''},
        wmszhch: {href: ''},
      },
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('activateDevMode', () => {
    it('sets the devMode to `true`; keeps everything else', () => {
      const action = AppActions.activateDevMode();
      const state = reducer(existingState, action);

      expect(state.devMode).toBe(true);
    });
  });
});
