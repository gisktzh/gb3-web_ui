import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ToolType} from '../../../shared/types/tool.type';
import {EditableTool, EditTarget} from '../states/tool.state';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Start Creation': props<{tool: ToolType}>(),
    'Start Editing': props<{tool: EditableTool; target: EditTarget}>(),
    'Complete Interaction': props<{interactionId: number}>(),
    'Cancel Interaction': emptyProps(),
    'Interaction Failed': props<{interactionId: number; error: unknown}>(),
  },
});
