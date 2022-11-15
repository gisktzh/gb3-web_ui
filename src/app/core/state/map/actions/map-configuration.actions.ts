import {createActionGroup, props} from '@ngrx/store';

export const MapConfigurationActions = createActionGroup({
  source: 'Map Configuration',
  events: {
    'Set Map Extent': props<{center: __esri.Point; scale: number}>()
  }
});
