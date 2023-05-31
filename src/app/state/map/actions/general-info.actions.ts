import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';

export const GeneralInfoActions = createActionGroup({
  source: 'GeneralInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update General Info': props<{generalInfo: GeneralInfoResponse}>(),
    'Clear General Info Content': emptyProps()
  }
});
