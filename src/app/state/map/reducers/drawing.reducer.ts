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
    on(
      DrawingActions.addDrawings,
      produce((draft, {drawings}) => {
        draft.drawings.push(...drawings);
      }),
    ),
    on(DrawingActions.clearDrawings, (): DrawingState => {
      return {...initialState};
    }),
    on(DrawingActions.clearDrawingLayer, (state, {layer}): DrawingState => {
      return {...initialState, drawings: state.drawings.filter((drawing) => drawing.source !== layer)};
    }),
    on(DrawingActions.overwriteDrawingLayersWithDrawings, (state, {drawingsToAdd, layersToOverride}): DrawingState => {
      const drawingsToKeep = state.drawings.filter((drawing) => !layersToOverride.includes(drawing.source));
      return {...initialState, drawings: [...drawingsToKeep, ...drawingsToAdd]};
    }),
  ),
});

export const {name, reducer, selectDrawingState, selectDrawings} = drawingFeature;
