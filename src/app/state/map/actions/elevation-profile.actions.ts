import {createActionGroup, props} from '@ngrx/store';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
import {Geometry} from 'geojson';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const ElevationProfileActions = createActionGroup({
  source: 'ElevationProfile',
  events: {
    'Load Profile': props<{geometry: Geometry}>(),
    'Update Content': props<{data: ElevationProfileData}>(),
    'Set Error': errorProps(),
  },
});
