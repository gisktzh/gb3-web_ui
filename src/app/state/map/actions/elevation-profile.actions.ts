import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const ElevationProfileActions = createActionGroup({
  source: 'ElevationProfile',
  events: {
    'Load Profile': emptyProps(),
    // todo LME: add typehint
    'Update Content': props<{data: any}>(),
  },
});
