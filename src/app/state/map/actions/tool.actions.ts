import {createActionGroup, emptyProps, props} from '@ngrx/store';

import {ToolType} from '../../../shared/types/tool-type';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Activate Tool': props<{tool: ToolType}>(),
    'Deactivate Tool': emptyProps(),
    'Cancel Tool': emptyProps()
  }
});
