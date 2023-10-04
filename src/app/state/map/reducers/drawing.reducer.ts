import {createFeature, createReducer, on} from '@ngrx/store';
import {DrawingState} from '../states/drawing.state';
import {DrawingActions} from '../actions/drawing.actions';
import {produce} from 'immer';

export const drawingFeatureKey = 'drawing';

export const initialState: DrawingState = {
  drawings: [],
};

export const drawingFeature = createFeature({
  name: drawingFeatureKey,
  reducer: createReducer(
    initialState,
    on(
      DrawingActions.addDrawing,
      produce((draft, {drawing}) => {
        draft.drawings.push(drawing);
      }),
    ),
    on(DrawingActions.clearDrawings, (): DrawingState => {
      return {...initialState};
    }),
    on(DrawingActions.clearDrawingLayer, (state, {layer}): DrawingState => {
      return {...initialState, drawings: state.drawings.filter((drawing) => drawing.source !== layer)};
    }),
  ),
});

export const {name, reducer, selectDrawingState, selectDrawings} = drawingFeature;
