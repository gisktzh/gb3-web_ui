import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const PrintActions = createActionGroup({
  source: 'Print',
  events: {
    'Request Print Creation': props<{creation: PrintCreation}>(),
    'Set Print Request Response': props<{creationResponse: PrintCreationResponse}>(),
    'Set Print Request Error': errorProps(),
    'Clear Print Request': emptyProps(),
    'Show Print Preview': props<{width: number; height: number; scale: number; rotation: number}>(),
    'Remove Print Preview': emptyProps(),
  },
});
