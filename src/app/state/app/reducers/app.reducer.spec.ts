import {initialState, reducer} from './app.reducer';
import {AppState} from '../states/app.state';
import {AppActions} from '../actions/app.actions';
import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';

describe('App Reducer', () => {
  let existingState: AppState;

  beforeEach(() => {
    existingState = {
      accessMode: 'internet',
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
      expect(state.accessMode).toEqual(existingState.accessMode);
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
      expect(state.accessMode).toBe(existingState.accessMode);
    });
  });

  describe('setAccessMode', () => {
    it('sets the accessMode to intranet; keeps everything else', () => {
      const action = AppActions.setAccessMode({accessMode: 'intranet'});
      const state = reducer(existingState, action);

      expect(state.accessMode).toEqual('intranet');
      expect(state.dynamicInternalUrlsConfiguration).toEqual(existingState.dynamicInternalUrlsConfiguration);
      expect(state.devMode).toEqual(existingState.devMode);
    });
  });
});
