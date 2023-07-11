import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';
import {PrintPreviewLayout} from '../../../shared/interfaces/print-preview-layout.interface';

export const PrintActions = createActionGroup({
  source: 'Print',
  events: {
    'Load Print Info': emptyProps(),
    'Set Print Info': props<{info: PrintInfo}>(),
    'Request Print Creation': props<{creation: PrintCreation}>(),
    'Set Print Creation Response': props<{creationResponse: PrintCreationResponse}>(),
    'Clear Print Creation': emptyProps(),
    'Show Print Preview': props<{layout: PrintPreviewLayout}>(),
    'Clear Print Preview': emptyProps()
  }
});
