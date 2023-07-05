import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ToolType} from '../states/tool.state';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Activate Tool': props<{tool: ToolType}>(),
    'Deactivate Tool': emptyProps()
  }
});
