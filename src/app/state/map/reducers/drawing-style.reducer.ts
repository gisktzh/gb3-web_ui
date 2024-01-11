import {createFeature, createReducer, on} from '@ngrx/store';
import {DrawingStyleState} from '../states/drawing-style.state';
import {DrawingStyleActions} from '../actions/drawing-style.actions';
import {defaultFillColor, defaultLineColor, defaultLineWidth} from '../../../shared/configs/drawing.config';

export const drawingStyleFeatureConfigKey = 'drawingStyle';

export const initialState: DrawingStyleState = {
  lineColor: defaultLineColor,
  fillColor: defaultFillColor,
  lineWidth: defaultLineWidth,
};

export const drawingStyleFeature = createFeature({
  name: drawingStyleFeatureConfigKey,
  reducer: createReducer(
    initialState,
    on(DrawingStyleActions.setDrawingStyles, (state, {fillColor, lineColor, lineWidth}): DrawingStyleState => {
      return {...state, fillColor, lineColor, lineWidth};
    }),
  ),
});

export const {name, reducer, selectDrawingStyleState} = drawingStyleFeature;
