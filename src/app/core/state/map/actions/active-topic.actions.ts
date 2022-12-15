import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ActiveTopic} from '../../../../map/models/active-topic.model';

export const ActiveTopicActions = createActionGroup({
  source: 'ActiveTopic',
  events: {
    'Add Active Topic': props<ActiveTopic>(),
    'Remove Active Topic': props<ActiveTopic>(),
    'Remove All Active Topics': emptyProps()
  }
});
