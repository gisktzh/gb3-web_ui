import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ZoomType} from '../../../shared/types/zoom.type';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {Coordinates} from '../../../shared/interfaces/coordinate.interface';

export const MapConfigActions = createActionGroup({
  source: 'Map Config',
  events: {
    'Mark Map Service As Initialized': emptyProps(),
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
    'Set Rotation': props<{rotation: number}>(),
    'Reset Extent': emptyProps(),
    'Change Zoom': props<{zoomType: ZoomType}>(),
    'Set Basemap': props<{activeBasemapId: string}>(),
    'Clear Initial Maps Config': emptyProps(),
    'Handle Map Click': props<Coordinates>(), // meta action which effects can hook into that need to deal with map clicks
    'Handle Map Rotation': props<{rotation: number}>(), // meta action which effects can hook into that need to deal with changes of the map rotation
    'Clear Feature Info Content': emptyProps(), // meta action which effects can hook into that need to clear the feature info
  },
});
