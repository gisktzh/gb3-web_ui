import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ActiveMapItem} from '../../../../map/models/active-map-item.model';

export const ActiveMapItemActions = createActionGroup({
  source: 'ActiveMapItem',
  events: {
    'Add Active Map Item': props<ActiveMapItem>(),
    'Remove Active Map Item': props<ActiveMapItem>(),
    'Remove All Active Map Items': emptyProps()
  }
});
