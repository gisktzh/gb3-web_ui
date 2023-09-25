import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PrintCapabilities, PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const PrintActions = createActionGroup({
  source: 'Print',
  events: {
    'Load Print Capabilities': emptyProps(),
    'Set Print Capabilities': props<{capabilities: PrintCapabilities}>(),
    'Set Print Capabilities Error': errorProps(),
    'Request Print Creation': props<{creation: PrintCreation}>(),
    'Set Print Creation Response': props<{creationResponse: PrintCreationResponse}>(),
    'Set Print Creation Error': errorProps(),
    'Clear Print Creation': emptyProps(),
    'Show Print Preview': props<{width: number; height: number; scale: number; rotation: number}>(),
    'Remove Print Preview': emptyProps(),
  },
});
