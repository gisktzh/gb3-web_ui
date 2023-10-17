import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

export const DrawingActions = createActionGroup({
  source: 'Drawing',
  events: {
    'Add Drawing': props<{drawing: Gb3StyledInternalDrawingRepresentation}>(),
    'Clear Drawings': emptyProps(),
    'Clear Drawing Layer': props<{layer: UserDrawingLayer}>(),
  },
});
