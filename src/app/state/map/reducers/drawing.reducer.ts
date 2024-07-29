import {createFeature, createReducer, on} from '@ngrx/store';
import {DrawingState} from '../states/drawing.state';
import {DrawingActions} from '../actions/drawing.actions';
import {produce} from 'immer';

export const drawingFeatureKey = 'drawing';

export const initialState: DrawingState = {
  drawings: [],
  selectedFeature: undefined,
};

export const drawingFeature = createFeature({
  name: drawingFeatureKey,
  reducer: createReducer(
    initialState,
    on(
      DrawingActions.addDrawing,
      produce((draft, {drawing}) => {
        draft.drawings = draft.drawings.filter((d) => d.properties.__id !== drawing.properties.__id);
        draft.drawings.push(drawing);
        draft.selectedFeature = undefined;
      }),
    ),
    on(
      DrawingActions.addDrawings,
      produce((draft, {drawings}) => {
        // Remove previous positions of this drawing and its corresponding labels
        const drawingsToKeep = draft.drawings.filter(
          (d) => d.properties.__id !== drawings[0].properties.__id && d.properties.__belongsTo !== drawings[0].properties.__id,
        );
        draft.drawings = [...drawingsToKeep, ...drawings];
        draft.selectedFeature = undefined;
      }),
    ),
    on(DrawingActions.editDrawing, (state, {drawingId}): DrawingState => {
      return {...state, selectedFeature: state.drawings.find((drawing) => drawing.properties.__id === drawingId)};
    }),
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

export const {name, reducer, selectDrawingState, selectDrawings, selectSelectedFeature} = drawingFeature;
