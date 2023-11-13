import {createActionGroup, props} from '@ngrx/store';
import {OverlayType} from '../../../shared/types/overlay.type';
import {PrintCreationResponse} from '../../../shared/interfaces/print.interface';

export const OverlayPrintActions = createActionGroup({
  source: 'OverlayPrint',
  events: {
    'Send Print Request': props<{overlay: OverlayType}>(),
    'Set Print Request Response': props<{overlay: OverlayType; creationResponse: PrintCreationResponse}>(),
    'Set Print Request Error': props<{overlay: OverlayType; error?: unknown}>(),
  },
});
