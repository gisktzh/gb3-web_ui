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

  describe('setFillColor', () => {
    it('sets the fill color and nothing else', () => {
      const mockColor: SymbolizationColor = {r: 5, g: 6, b: 7, a: 0.1};
      const action = DrawingStyleActions.setFillColor({color: mockColor});

      const result = reducer(mockExistingState, action);

      expect(result.fillColor).toEqual(mockColor);
      expect(result.lineColor).toEqual(mockExistingState.lineColor);
      expect(result.lineWidth).toEqual(mockExistingState.lineWidth);
    });
  });

  describe('setLineColor', () => {
    it('sets the line color and nothing else', () => {
      const mockColor: SymbolizationColor = {r: 5, g: 6, b: 7, a: 0.1};
      const action = DrawingStyleActions.setLineColor({color: mockColor});

      const result = reducer(mockExistingState, action);

      expect(result.lineColor).toEqual(mockColor);
      expect(result.fillColor).toEqual(mockExistingState.fillColor);
      expect(result.lineWidth).toEqual(mockExistingState.lineWidth);
    });
  });

  describe('setLineWidth', () => {
    it('sets the line width with "px" postfix and nothing else', () => {
      const mockLineWidth = 1337;
      const action = DrawingStyleActions.setLineWidth({width: mockLineWidth});

      const result = reducer(mockExistingState, action);

      expect(result.lineWidth).toEqual(mockLineWidth);
      expect(result.fillColor).toEqual(mockExistingState.fillColor);
      expect(result.lineColor).toEqual(mockExistingState.lineColor);
    });
  });
});
