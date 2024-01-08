import {initialState, reducer} from './external-map-item.reducer';
import {ExternalMapItemState} from '../states/external-map-item.state';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {createExternalWmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';

describe('external map item reducer', () => {
  let existingState: ExternalMapItemState;

  beforeEach(() => {
    existingState = {
      loadingState: 'loaded',
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadItem', () => {
    it('sets the loading state to `loading`', () => {
      const expectedLoadingState: LoadingState = 'loading';

      const action = ExternalMapItemActions.loadItem({url: 'some url', serviceType: 'wms'});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(expectedLoadingState);
    });
  });

  describe('setItem', () => {
    it('sets the loading state to `loaded`', () => {
      existingState.loadingState = 'loading';
      const expectedLoadingState: LoadingState = 'loaded';

      const action = ExternalMapItemActions.setItem({externalMapItem: createExternalWmsMapItemMock('some url', 'some title', [])});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(expectedLoadingState);
    });
  });

  describe('setItemError', () => {
    it('sets the loading state to `error`', () => {
      const expectedLoadingState: LoadingState = 'error';

      const action = ExternalMapItemActions.setItemError({error: new Error('some error')});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(expectedLoadingState);
    });
  });

  describe('clearLoadingState', () => {
    it('resets the loading state', () => {
      const action = ExternalMapItemActions.clearLoadingState();
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(initialState.loadingState);
    });
  });
});
