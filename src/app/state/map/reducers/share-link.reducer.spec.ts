import {initialState, reducer} from './share-link.reducer';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkState} from '../states/share-link.state';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';

describe('shareLink Reducer', () => {
  const shareLinkItemMock: ShareLinkItem = {
    basemapId: 'arelkbackgroundzh',
    center: {x: 2675158, y: 1259964},
    scale: 18000,
    content: [],
    drawings: [],
    measurements: [],
  };

  const shareLinkItemIdMock: string = 'mock-id';
  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: ShareLinkState;

  beforeEach(() => {
    existingState = {
      loadingState: 'loaded',
      item: shareLinkItemMock,
      id: 'abc',
      applicationInitializationLoadingState: 'loaded',
      savingState: 'loaded',
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadItem', () => {
    it('sets the loading state to `loading` and resets the item to its initial state', () => {
      const action = ShareLinkActions.loadItem({id: 'mock-id'});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loading');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe('loaded');
      expect(state.applicationInitializationLoadingState).toBe('loaded');
    });
  });

  describe('setLoadingError', () => {
    it('sets the loading state to `error` on failure and resets the item to its initial state', () => {
      const action = ShareLinkActions.setLoadingError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('error');
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.applicationInitializationLoadingState).toBe(initialState.applicationInitializationLoadingState);
    });
  });

  describe('setItem', () => {
    it('sets the loading state to `loaded` on success and sets the item', () => {
      existingState.loadingState = 'loading';
      existingState.item = undefined;
      const action = ShareLinkActions.setItem({item: shareLinkItemMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.applicationInitializationLoadingState).toBe('loaded');
    });
  });

  describe('createItem', () => {
    it('sets the saving state to `loading` and resets the id', () => {
      const action = ShareLinkActions.createItem({item: shareLinkItemMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loading');
      expect(state.applicationInitializationLoadingState).toBe('loaded');
    });
  });

  describe('setCreationError', () => {
    it('sets the saving state to `error` on failure and resets the state to its initial state', () => {
      const action = ShareLinkActions.setCreationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(initialState.loadingState);
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe('error');
      expect(state.applicationInitializationLoadingState).toBe(initialState.applicationInitializationLoadingState);
    });
  });

  describe('setItemId', () => {
    it('sets the saving state to `loaded` on success and sets the item id', () => {
      existingState.savingState = 'loading';
      existingState.id = undefined;
      const action = ShareLinkActions.setItemId({id: shareLinkItemIdMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe(shareLinkItemIdMock);
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.applicationInitializationLoadingState).toBe('loaded');
    });
  });

  describe('initializeApplicationBasedOnId', () => {
    it('sets the application initialization loading state to `loading` and resets the rest if the state to its initial state', () => {
      const action = ShareLinkActions.initializeApplicationBasedOnId({id: shareLinkItemIdMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(initialState.loadingState);
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.applicationInitializationLoadingState).toBe('loading');
    });
  });

  describe('setInitializationError', () => {
    it('sets the application initialization loading state to `error` on failure and resets the state to its initial state', () => {
      const action = ShareLinkActions.setInitializationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(initialState.loadingState);
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.applicationInitializationLoadingState).toBe('error');
    });
  });

  describe('completeApplicationInitialization', () => {
    it('sets the application initialization loading state to `loaded` on success', () => {
      existingState.applicationInitializationLoadingState = 'loading';
      const action = ShareLinkActions.completeApplicationInitialization();
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.applicationInitializationLoadingState).toBe('loaded');
    });
  });
});
