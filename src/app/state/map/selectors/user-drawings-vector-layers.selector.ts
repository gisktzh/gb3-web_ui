import {createSelector} from '@ngrx/store';
import {selectDrawings} from '../reducers/drawing.reducer';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {selectVisibleDrawingLayers} from './visible-drawing-layers.selector';

export const selectUserDrawingsVectorLayers = createSelector(
  selectDrawings,
  selectVisibleDrawingLayers,
  (drawings, visibleDrawingLayers) => {
    const drawingsToDraw = drawings.filter((d) => d.source === UserDrawingLayer.Drawings && visibleDrawingLayers.includes(d.source));
    const measurementsToDraw = drawings.filter(
      (d) => d.source === UserDrawingLayer.Measurements && visibleDrawingLayers.includes(d.source),
    );

    return {
      drawings: drawingsToDraw,
      measurements: measurementsToDraw,
    };
  },
);
