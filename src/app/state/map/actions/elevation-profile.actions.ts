import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';

export const ElevationProfileActions = createActionGroup({
  source: 'ElevationProfile',
  events: {
    'Load Profile': emptyProps(),
    'Update Content': props<{data: ElevationProfileData}>(),
  },
});
