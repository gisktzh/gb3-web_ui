import {initialState as defaultInitialState, reducer} from './drawing.reducer';
import {DrawingActions} from '../actions/drawing.actions';
import {DrawingState} from '../states/drawing.state';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MapConstants} from '../../../shared/constants/map.constants';

describe('Drawing Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(defaultInitialState, action);

      expect(result).toBe(defaultInitialState);
    });
  });

  describe('clearDrawings', () => {
    it('removes all layers', () => {
      const currentState: DrawingState = {
        drawings: [
          'mockDrawing1' as unknown as Gb3StyledInternalDrawingRepresentation,
          'mockDrawing2' as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };
      const action = DrawingActions.clearDrawings();

      const result = reducer(currentState, action);

      expect(result).toEqual(defaultInitialState);
    });
  });

  describe('selectDrawing', () => {
    it('selects a drawing based on its Id', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: '1'}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: '2'}} as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };
      const action = DrawingActions.selectDrawing({drawingId: '1'});

      const result = reducer(currentState, action);

      expect(result.selectedDrawing).toEqual(currentState.drawings[0]);
    });
  });

  describe('deleteDrawing', () => {
    it('selects a drawing based on its Id', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: '1'}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: '2'}} as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };
      const action = DrawingActions.deleteDrawing({drawingId: '1'});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(1);
      expect(result.drawings).toEqual([currentState.drawings[1]]);
    });
  });

  describe('addDrawing', () => {
    it('adds a drawing to the end of the current drawings', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 1}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 2}} as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };

      const newDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {[MapConstants.DRAWING_IDENTIFIER]: 3},
      } as unknown as Gb3StyledInternalDrawingRepresentation;
      const action = DrawingActions.addDrawing({drawing: newDrawing});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(3);
      expect(result.drawings[2]).toEqual(newDrawing);
    });
    it('replaces a drawing if it already exists in the state', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 1}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 2}} as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };

      const newDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {[MapConstants.DRAWING_IDENTIFIER]: 2},
      } as unknown as Gb3StyledInternalDrawingRepresentation;
      const action = DrawingActions.addDrawing({drawing: newDrawing});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(2);
      expect(result.drawings[1]).toEqual(newDrawing);
    });
  });

  describe('addDrawings', () => {
    it('adds drawings to the end of the current drawings', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 1}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {
            properties: {[MapConstants.DRAWING_IDENTIFIER]: 2, [MapConstants.BELONGS_TO_IDENTIFIER]: 1},
          } as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };

      const newDrawings: Gb3StyledInternalDrawingRepresentation[] = [
        {
          properties: {[MapConstants.DRAWING_IDENTIFIER]: 3},
        },
        {
          properties: {[MapConstants.DRAWING_IDENTIFIER]: 4, [MapConstants.BELONGS_TO_IDENTIFIER]: 3},
        },
      ] as unknown as Gb3StyledInternalDrawingRepresentation[];
      const action = DrawingActions.addDrawings({drawings: newDrawings});

      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(4);
      expect(result.drawings[2]).toEqual(newDrawings[0]);
      expect(result.drawings[3]).toEqual(newDrawings[1]);
    });
    it('replaces drawings if they already exist in the state', () => {
      const currentState: DrawingState = {
        drawings: [
          {properties: {[MapConstants.DRAWING_IDENTIFIER]: 1}} as unknown as Gb3StyledInternalDrawingRepresentation,
          {
            properties: {[MapConstants.DRAWING_IDENTIFIER]: 2, [MapConstants.BELONGS_TO_IDENTIFIER]: 1},
          } as unknown as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
      };

      const newDrawings: Gb3StyledInternalDrawingRepresentation[] = [
        {
          properties: {[MapConstants.DRAWING_IDENTIFIER]: 1},
        },
        {
          properties: {[MapConstants.DRAWING_IDENTIFIER]: 4, [MapConstants.BELONGS_TO_IDENTIFIER]: 1},
        },
      ] as unknown as Gb3StyledInternalDrawingRepresentation[];
      const action = DrawingActions.addDrawings({drawings: newDrawings});
      const result = reducer(currentState, action);

      expect(result.drawings.length).toEqual(2);
      expect(result.drawings[0]).toEqual(newDrawings[0]);
    });
  });

  describe('clearDrawingLayer', () => {
    let currentState: DrawingState;

    beforeEach(() => {
      currentState = {
        drawings: [
          {source: UserDrawingLayer.Drawings, id: 'drawingLayer1'} as Gb3StyledInternalDrawingRepresentation,
          {source: UserDrawingLayer.Drawings, id: 'drawingLayer2'} as Gb3StyledInternalDrawingRepresentation,
          {source: UserDrawingLayer.Measurements, id: 'measurementLayer1'} as Gb3StyledInternalDrawingRepresentation,
          {source: UserDrawingLayer.Measurements, id: 'measurementLayer2'} as Gb3StyledInternalDrawingRepresentation,
        ],
        selectedDrawing: undefined,
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
