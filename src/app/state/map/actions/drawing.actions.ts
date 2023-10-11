import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {InternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

export const DrawingActions = createActionGroup({
  source: 'Drawing',
  events: {
    'Add Drawing': props<{drawing: InternalDrawingRepresentation}>(),
    'Clear Drawings': emptyProps(),
    'Clear Drawing Layer': props<{layer: UserDrawingLayer}>(),
  },
});
