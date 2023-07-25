import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';

export const GeneralInfoActions = createActionGroup({
  source: 'GeneralInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Content': props<{generalInfo: GeneralInfoResponse}>(),
    'Clear Content': emptyProps(),
  },
});
