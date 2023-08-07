import {createActionGroup, emptyProps, props} from '@ngrx/store';

import {ToolType} from '../../../shared/types/tool.type';
import {Feature} from 'geojson';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Activate Tool': props<{tool: ToolType}>(),
    'Deactivate Tool': props<{features?: Feature[]}>(),
    'Cancel Tool': emptyProps(),
  },
});
