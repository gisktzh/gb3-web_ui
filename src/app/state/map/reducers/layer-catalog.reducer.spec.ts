import {initialState, reducer} from './layer-catalog.reducer';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';

describe('LayerCatalog Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('stores and clears pending initial topics', () => {
    const withPendingTopics = reducer(initialState, LayerCatalogActions.setInitialTopics({topicIds: ['one', 'two']}));

    expect(withPendingTopics.pendingInitialTopicIds).toEqual(['one', 'two']);
    expect(reducer(withPendingTopics, LayerCatalogActions.clearInitialTopics()).pendingInitialTopicIds).toBeUndefined();
  });

  it('keeps pending initial topics while loading the catalogue', () => {
    const state = {...initialState, pendingInitialTopicIds: ['requested']};

    const result = reducer(state, LayerCatalogActions.loadLayerCatalog());

    expect(result.pendingInitialTopicIds).toEqual(['requested']);
  });
});
