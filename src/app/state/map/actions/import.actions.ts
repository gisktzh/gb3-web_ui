import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const ImportActions = createActionGroup({
  source: 'Export',
  events: {
    'Request Drawings Import': props<{file: File | Blob}>(),
    'Set Drawings Import Request Response': emptyProps(),
    'Set Drawings Import Request Error': errorProps(),
  },
});
