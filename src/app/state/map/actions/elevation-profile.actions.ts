import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
import {Geometry} from 'geojson';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const ElevationProfileActions = createActionGroup({
  source: 'ElevationProfile',
  events: {
    'Load Profile': props<{geometry: Geometry}>(),
    'Set Profile': props<{data: ElevationProfileData}>(),
    'Set Profile Error': errorProps(),
    'Clear Profile': emptyProps(),
    'Draw Elevation Profile Hover Location': props<{location: PointWithSrs}>(),
    'Remove Elevation Profile Hover Location': emptyProps(),
  },
});
