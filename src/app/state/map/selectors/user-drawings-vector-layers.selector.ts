import {createSelector, MemoizedSelector} from '@ngrx/store';
import {UserDrawingVectorLayers} from '../../../shared/interfaces/user-drawing-vector-layers.interface';
import {selectDrawings} from '../reducers/drawing.reducer';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {selectVisibleDrawingLayers} from './visible-drawing-layers.selector';

export const selectUserDrawingsVectorLayers: MemoizedSelector<Record<string, any>, UserDrawingVectorLayers> = createSelector(
  selectDrawings,
  selectVisibleDrawingLayers,
  (drawings, visibleDrawingLayers) => {
    const drawingsToDraw = drawings.filter((d) => d.source === UserDrawingLayer.Drawings && visibleDrawingLayers.includes(d.source));
    const measurementsToDraw = drawings.filter(
      (d) => d.source === UserDrawingLayer.Measurements && visibleDrawingLayers.includes(d.source),
    );

    return {
      drawings: SymbolizationToGb3ConverterUtils.convert(drawingsToDraw),
      measurements: SymbolizationToGb3ConverterUtils.convert(measurementsToDraw),
    };
  },
);