import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingLayer, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

export const DrawingActions = createActionGroup({
  source: 'Drawing',
  events: {
    'Add Drawing': props<{drawing: Gb3StyledInternalDrawingRepresentation}>(),
    'Add Drawings': props<{drawings: Gb3StyledInternalDrawingRepresentation[]}>(),
    'Clear Drawings': emptyProps(),
    'Clear Drawing Layer': props<{layer: UserDrawingLayer}>(),
    'Select Drawing': props<{drawingId: string}>(),
    'Delete Drawing': props<{drawingId: string}>(),
    'Update Drawing Styles': props<{drawing: Gb3StyledInternalDrawingRepresentation; style: Gb3StyleRepresentation; labelText?: string}>(),
    /**
     * This action can be used to remove one (or more) DrawingLayer's drawings from the state and add new layers. This is useful
     * (mostly) in the context of loading favourites, because it allows us to properly handle edge cases where a user might have
     * drawings and adds a favourite with measurements, which means we should NOT clear the drawings from the state.
     */
    'Overwrite Drawing Layers With Drawings': props<{
      layersToOverride: DrawingLayer[];
      drawingsToAdd: Gb3StyledInternalDrawingRepresentation[];
    }>(),
  },
});
