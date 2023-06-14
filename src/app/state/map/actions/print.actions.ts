import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';

export const PrintActions = createActionGroup({
  source: 'Print',
  events: {
    'Load Print Info': emptyProps(),
    'Set Print Info': props<{printInfo: PrintInfo}>(),
    'Request Print Creation': props<{printCreation: PrintCreation}>(),
    'Set Print Creation Response': props<{printCreationResponse: PrintCreationResponse}>()
  }
});
