import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const PrintActions = createActionGroup({
  source: 'Print',
  events: {
    'Load Print Info': emptyProps(),
    'Set Print Info': props<{info: PrintInfo}>(),
    'Request Print Creation': props<{creation: PrintCreation}>(),
    'Set Print Creation Response': props<{creationResponse: PrintCreationResponse}>(),
    'Clear Print Creation': emptyProps(),
    'Show Print Preview': props<{width: number; height: number; scale: number; rotation: number}>(),
    'Remove Print Preview': emptyProps(),
    'Set Print Request Error': errorProps(),
    'Set Print Info Error': errorProps(),
  },
});
