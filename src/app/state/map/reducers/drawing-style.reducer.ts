import {createFeature, createReducer, on} from '@ngrx/store';
import {DrawingStyleState} from '../states/drawing-style.state';
import {DrawingStyleActions} from '../actions/drawing-style.actions';

export const drawingStyleFeatureConfigKey = 'drawingStyle';

export const initialState: DrawingStyleState = {
  lineColor: undefined,
  fillColor: undefined,
  lineWidth: undefined,
};

export const drawingStyleFeature = createFeature({
  name: drawingStyleFeatureConfigKey,
  reducer: createReducer(
    initialState,
    on(DrawingStyleActions.setFillColor, (state, {color}): DrawingStyleState => {
      return {...state, fillColor: color};
    }),
    on(DrawingStyleActions.setLineColor, (state, {color}): DrawingStyleState => {
      return {...state, lineColor: color};
    }),
    on(DrawingStyleActions.setLineWidth, (state, {width}): DrawingStyleState => {
      return {...state, lineWidth: `${width}`};
    }),
  ),
});

export const {name, reducer, selectDrawingStyleState} = drawingStyleFeature;
