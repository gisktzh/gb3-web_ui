import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Coordinates} from '../../../shared/interfaces/coordinate.interface';

export const GeneralInfoActions = createActionGroup({
  source: 'GeneralInfo',
  events: {
    'Send Request': props<Coordinates>(),
    'Update Content': props<{generalInfo: GeneralInfoResponse}>(),
    'Clear Content': emptyProps(),
    'Set Error': errorProps(),
  },
});
