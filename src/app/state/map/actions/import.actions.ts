import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';

export const ImportActions = createActionGroup({
  source: 'Export',
  events: {
    'Request Drawings Import': props<{file: File | Blob}>(),
    'Set Drawings Import Request Error': errorProps(),
    'Create Active Map Item From Drawing': props<{drawing: Gb3VectorLayer}>(),
    'Add Drawing to Map': props<{
      activeMapItem: DrawingActiveMapItem;
      drawingLayersToOverride: UserDrawingLayer[];
      drawingsToAdd: Gb3StyledInternalDrawingRepresentation[];
    }>(),
    'Reset Drawing Import State': emptyProps(),
  },
});
