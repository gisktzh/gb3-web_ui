import {createActionGroup, emptyProps, props} from '@ngrx/store';

import {ToolType} from '../../../shared/types/tool.type';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Switch Tool': props<{tool: ToolType}>(),
    'Activate Tool': props<{tool: ToolType}>(),
    'Deactivate Tool': emptyProps(),
    'Cancel Tool': emptyProps(),
  },
});
