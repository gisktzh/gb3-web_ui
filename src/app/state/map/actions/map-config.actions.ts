import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ZoomType} from '../../../shared/types/zoom-type';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const MapConfigActions = createActionGroup({
  source: 'Map Config',
  events: {
    'Set Initial Map Config': props<{
      x: number | undefined;
      y: number | undefined;
      scale: number | undefined;
      basemapId: string;
      initialMaps: string[];
    }>(),
    'Set Map Extent': props<{x: number; y: number; scale: number}>(),
    'Set Map Center': props<{center: PointWithSrs}>(),
    'Set Ready': props<{calculatedMinScale: number; calculatedMaxScale: number}>(),
    'Set Scale': props<{scale: number}>(),
    'Reset Extent': emptyProps(),
    'Change Zoom': props<{zoomType: ZoomType}>(),
    'Set Basemap': props<{activeBasemapId: string}>(),
    'Clear Initial Maps Config': emptyProps()
  }
});
