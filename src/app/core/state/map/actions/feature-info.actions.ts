import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Clear Feature Info Content': emptyProps()
  }
});
