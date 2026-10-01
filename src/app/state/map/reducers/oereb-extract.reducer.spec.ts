import {initialState, reducer} from './oereb-extract.reducer';
import {OerebExtractActions} from '../actions/oereb-extract.actions';
import {OerebExtractState} from '../states/oereb-extract.state';

describe('OerebExtract Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('sendRequest', () => {
    it('sets the queryLocation and loadingState, and resets the remaining state', () => {
      const x = 123;
      const y = 456;

      const action = OerebExtractActions.sendRequest({x, y});

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        queryLocation: {x, y},
        loadingState: 'loading',
      });
    });

    it('resets existing data when a new request is sent', () => {
      const mockState: OerebExtractState = {
        queryLocation: {x: 1, y: 2},
        loadingState: 'loaded',
        data: {} as OerebExtractState['data'],
      };

      const action = OerebExtractActions.sendRequest({
        x: 123,
        y: 456,
      });

      const result = reducer(mockState, action);

      expect(result).toEqual({
        ...initialState,
        queryLocation: {x: 123, y: 456},
        loadingState: 'loading',
      });
    });
  });

  describe('clearContent', () => {
    it('resets the state to initialState', () => {
      const mockState: OerebExtractState = {
        queryLocation: {x: 123, y: 456},
        loadingState: 'loaded',
        data: {} as OerebExtractState['data'],
      };

      const action = OerebExtractActions.clearContent();

      const result = reducer(mockState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('updateContent', () => {
    it('sets data and loadingState to loaded', () => {
      const oerebExtract = {} as OerebExtractState['data'];

      const action = OerebExtractActions.updateContent({
        oerebExtract,
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loadingState: 'loaded',
        data: oerebExtract,
      });
    });

    it('preserves the existing queryLocation', () => {
      const mockState: OerebExtractState = {
        queryLocation: {x: 123, y: 456},
        loadingState: 'loading',
        data: null,
      };

      const oerebExtract = {} as OerebExtractState['data'];

      const action = OerebExtractActions.updateContent({
        oerebExtract,
      });

      const result = reducer(mockState, action);

      expect(result).toEqual({
        ...mockState,
        loadingState: 'loaded',
        data: oerebExtract,
      });
    });

    it('sets data to null when the extract is null', () => {
      const mockState: OerebExtractState = {
        queryLocation: {x: 123, y: 456},
        loadingState: 'loading',
        data: {} as OerebExtractState['data'],
      };

      const action = OerebExtractActions.updateContent({
        oerebExtract: null,
      });

      const result = reducer(mockState, action);

      expect(result).toEqual({
        ...mockState,
        loadingState: 'loaded',
        data: null,
      });
    });
  });

  describe('setError', () => {
    it('sets loadingState to error and resets the remaining state', () => {
      const error = new Error('Something went wrong');

      const mockState: OerebExtractState = {
        queryLocation: {x: 123, y: 456},
        loadingState: 'loading',
        data: {} as OerebExtractState['data'],
      };

      const action = OerebExtractActions.setError({error});

      const result = reducer(mockState, action);

      expect(result).toEqual({
        ...initialState,
        loadingState: 'error',
      });
    });
  });
});
