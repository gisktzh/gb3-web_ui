import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const MapConfigurationActions = createActionGroup({
  source: 'Map Configuration',
  events: {
    'Set Initial Extent': props<{x: number | undefined; y: number | undefined; scale: number | undefined}>(),
    'Set Map Extent': props<{x: number; y: number; scale: number}>(),
    'Set Ready': emptyProps(),
    'Set Scale': props<{scale: number}>(),
    'Reset Extent': emptyProps()
  }
});
