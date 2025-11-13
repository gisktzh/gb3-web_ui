import {createSelector} from '@ngrx/store';
import {selectDrawings} from '../reducers/drawing.reducer';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
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
      drawings: SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(drawingsToDraw, 1, 1), // Scale and DPI don't matter here
      measurements: SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(measurementsToDraw, 1, 1),
    };
  },
);
