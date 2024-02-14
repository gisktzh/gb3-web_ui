import {initialState, reducer} from './app.reducer';
import {AppState} from '../states/app.state';
import {AppActions} from '../actions/app.actions';
import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';

describe('App Reducer', () => {
  let existingState: AppState;

  beforeEach(() => {
    existingState = {
      devMode: false,
      dynamicInternalUrlsConfiguration: {
        geolion: {href: ''},
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
      expect(state.dynamicInternalUrlsConfiguration).toEqual(existingState.dynamicInternalUrlsConfiguration);
    });
  });

  describe('setDynamicInternalUrlConfiguration', () => {
    it('sets the dynamicInternalUrlsConfiguration to the supplied data; keeps everything else', () => {
      const dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration = {
        geolion: {href: 'xx'},
      };
      const action = AppActions.setDynamicInternalUrlConfiguration({dynamicInternalUrlsConfiguration});
      const state = reducer(existingState, action);

      expect(state.dynamicInternalUrlsConfiguration).toEqual(dynamicInternalUrlsConfiguration);
      expect(state.devMode).toBe(existingState.devMode);
    });
  });
});
