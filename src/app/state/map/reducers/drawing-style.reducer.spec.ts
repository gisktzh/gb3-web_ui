import {initialState as defaultInitialState, reducer} from './drawing-style.reducer';
import {DrawingStyleState} from '../states/drawing-style.state';
import {DrawingStyleActions} from '../actions/drawing-style.actions';
import {SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';

describe('DrawingStyle Reducer', () => {
  const mockExistingState: DrawingStyleState = {
    lineColor: {r: 255, g: 123, b: 1, a: 0.2},
    fillColor: {r: 13, g: 3, b: 24, a: 0.4},
    lineWidth: 20,
  };

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(defaultInitialState, action);

      expect(result).toBe(defaultInitialState);
    });
  });

  describe('setDrawingStyles', () => {
    it('sets the styles for all three properties', () => {
      const mockColor: SymbolizationColor = {r: 5, g: 6, b: 7, a: 0.1};
      const action = DrawingStyleActions.setDrawingStyles({fillColor: mockColor, lineColor: mockColor, lineWidth: 2});

      const result = reducer(mockExistingState, action);

      expect(result.fillColor).toEqual(mockColor);
      expect(result.lineColor).toEqual(mockColor);
      expect(result.lineWidth).toEqual(2);
    });
  });
});
