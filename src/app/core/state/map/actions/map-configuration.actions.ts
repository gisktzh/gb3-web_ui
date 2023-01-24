import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ZoomType} from '../../../../shared/types/zoom-type';

export const MapConfigurationActions = createActionGroup({
  source: 'Map Configuration',
  events: {
    'Set Initial Map Configuration': props<{x: number | undefined; y: number | undefined; scale: number | undefined; basemapId: string}>(),
    'Set Map Extent': props<{x: number; y: number; scale: number}>(),
    'Set Ready': props<{calculatedMinScale: number; calculatedMaxScale: number}>(),
    'Set Scale': props<{scale: number}>(),
    'Reset Extent': emptyProps(),
    'Change Zoom': props<{zoomType: ZoomType}>(),
    'Set Basemap': props<{activeBasemapId: string}>()
  }
});
