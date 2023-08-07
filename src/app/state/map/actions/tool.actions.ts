import {createActionGroup, emptyProps, props} from '@ngrx/store';

import {ToolType} from '../../../shared/types/tool.type';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const ToolActions = createActionGroup({
  source: 'Tool',
  events: {
    'Activate Tool': props<{tool: ToolType}>(),
    'Deactivate Tool': props<{geometries?: GeometryWithSrs[]}>(),
    'Cancel Tool': emptyProps(),
  },
});
