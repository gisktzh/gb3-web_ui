import {initialState as defaultInitialState, reducer} from './drawing.reducer';
import {DrawingActions} from '../actions/drawing.actions';
import {DrawingState} from '../states/drawing.state';
import {InternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

describe('Drawing Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(defaultInitialState, action);

      expect(result).toBe(defaultInitialState);
    });
  });

  describe('clearDrawings', () => {
    it('removes all layers', () => {
      const currentState: DrawingState = {
        drawings: ['mockDrawing1' as unknown as InternalDrawingRepresentation, 'mockDrawing2' as unknown as InternalDrawingRepresentation],
      };
      const action = DrawingActions.clearDrawings();

      const result = reducer(currentState, action);

      expect(result).toEqual(defaultInitialState);
    });
  });

  describe('addDrawing', () => {
    it('adds a drawing to the end of the current drawings', () => {
      const currentState: DrawingState = {
        drawings: ['mockDrawing1' as unknown as InternalDrawingRepresentation, 'mockDrawing2' as unknown as InternalDrawingRepresentation],
      };

      const newDrawing: InternalDrawingRepresentation = 'mockNewDrawing' as unknown as InternalDrawingRepresentation;
      const action = DrawingActions.addDrawing({drawing: newDrawing});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(3);
      expect(result.drawings[2]).toEqual(newDrawing);
    });
  });

  describe('clearDrawingLayer', () => {
    let currentState: DrawingState;

    beforeEach(() => {
      currentState = {
        drawings: [
          {source: UserDrawingLayer.Drawings, id: 'drawingLayer1'} as InternalDrawingRepresentation,
          {source: UserDrawingLayer.Drawings, id: 'drawingLayer2'} as InternalDrawingRepresentation,
          {source: UserDrawingLayer.Measurements, id: 'measurementLayer1'} as InternalDrawingRepresentation,
          {source: UserDrawingLayer.Measurements, id: 'measurementLayer2'} as InternalDrawingRepresentation,
        ],
      };
    });

    it('removes the DrawingLayer drawings only if the drawing layer is removed', () => {
      const action = DrawingActions.clearDrawingLayer({layer: UserDrawingLayer.Drawings});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(2);
      expect(result.drawings[0].id).toEqual('measurementLayer1');
      expect(result.drawings[1].id).toEqual('measurementLayer2');
    });

    it('removes the MeasurementLayer drawings only if the measurement layer is removed', () => {
      const action = DrawingActions.clearDrawingLayer({layer: UserDrawingLayer.Measurements});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(2);
      expect(result.drawings[0].id).toEqual('drawingLayer1');
      expect(result.drawings[1].id).toEqual('drawingLayer2');
    });
  });
});
