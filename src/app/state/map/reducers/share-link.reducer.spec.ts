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

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadItem', () => {
    it('sets the loading state to `loading` and resets the item to its initial state', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.loadItem({id: 'mock-id'});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loading');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('setLoadingError', () => {
    it('sets the loading state to `error` on failure and resets the item to its initial state', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.setLoadingError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('error');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('setItem', () => {
    it('sets the loading state to `loaded` on success and sets the item', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loading',
        item: undefined,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.setItem({item: shareLinkItemMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('createItem', () => {
    it('sets the saving state to `loading` and resets the id', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.createItem({item: shareLinkItemMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loading');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('setCreationError', () => {
    it('sets the saving state to `error` on failure and resets the id to its initial state', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.setCreationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('error');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('setItemId', () => {
    it('sets the saving state to `loaded` on success and sets the item id', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loading',
      };
      const action = ShareLinkActions.setItemId({id: shareLinkItemIdMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe(shareLinkItemIdMock);
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });

  describe('initializeApplicationBasedOnId', () => {
    it('sets the initialize application loading state to `loading` and resets the rest if the state to its initial state', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.initializeApplicationBasedOnId({id: shareLinkItemIdMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe(initialState.loadingState);
      expect(state.id).toBe(initialState.id);
      expect(state.item).toEqual(initialState.item);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.initializeApplicationLoadingState).toBe('loading');
    });
  });

  describe('setInitializationError', () => {
    it('sets the initialize application loading state to `error` on failure', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loaded',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.setInitializationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('error');
    });
  });

  describe('completeApplicationInitialization', () => {
    it('sets the initialize application loading state to `loaded` on success', () => {
      const existingState: ShareLinkState = {
        loadingState: 'loaded',
        item: shareLinkItemMock,
        id: 'abc',
        initializeApplicationLoadingState: 'loading',
        savingState: 'loaded',
      };
      const action = ShareLinkActions.completeApplicationInitialization();
      const state = reducer(existingState, action);

      expect(state.loadingState).toBe('loaded');
      expect(state.id).toBe('abc');
      expect(state.item).toEqual(shareLinkItemMock);
      expect(state.savingState).toBe('loaded');
      expect(state.initializeApplicationLoadingState).toBe('loaded');
    });
  });
});
