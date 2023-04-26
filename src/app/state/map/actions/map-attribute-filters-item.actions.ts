import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const MapAttributeFiltersItemActions = createActionGroup({
  source: 'MapAttributeFiltersItem',
  events: {
    'Set Map Attribute Filters Item Id': props<{id: string}>(),
    'Clear Map Attribute Filters Item Id': emptyProps()
  }
});
