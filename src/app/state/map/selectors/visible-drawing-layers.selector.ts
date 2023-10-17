import {createSelector} from '@ngrx/store';
import {selectDrawingLayers} from './drawing-layers.selector';

export const selectVisibleDrawingLayers = createSelector(selectDrawingLayers, (drawingLayers) => {
  return drawingLayers.filter((drawingLayer) => drawingLayer.visible).map((drawingLayer) => drawingLayer.settings.userDrawingLayer);
});
