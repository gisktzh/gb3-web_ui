import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Coordinate} from 'src/app/shared/interfaces/coordinate.interface';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {errorProps} from 'src/app/shared/utils/error-props.utils';

export const OerebExtractActions = createActionGroup({
  source: 'OerebExtract',
  events: {
    'Send Request': props<Coordinate>(),
    'Update Content': props<{oerebExtract: OerebExtractResponse | null}>(),
    'Clear Content': emptyProps(),
    'Set Error': errorProps(),
  },
});
