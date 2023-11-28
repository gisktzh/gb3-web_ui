import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
import {Geometry} from 'geojson';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const ElevationProfileActions = createActionGroup({
  source: 'ElevationProfile',
  events: {
    'Load Profile': props<{geometry: Geometry}>(),
    'Set Profile': props<{data: ElevationProfileData}>(),
    'Set Profile Error': errorProps(),
    'Clear Profile': emptyProps(),
  },
});
