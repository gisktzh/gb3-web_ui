import {initialState, reducer} from './map-attribute-filters-item.reducer';

describe('MapAttributeFiltersItem Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
