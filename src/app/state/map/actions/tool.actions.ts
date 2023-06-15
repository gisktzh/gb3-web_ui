import {createActionGroup, emptyProps} from '@ngrx/store';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    toggle: emptyProps()
  }
});
