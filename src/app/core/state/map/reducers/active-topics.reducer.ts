import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveTopicActions} from '../actions/active-topic.actions';
import {ActiveTopic} from '../../../../map/models/active-topic.model';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../../shared/enums/loading-state';

export const activeTopicsFeatureKey = 'activeTopics';

export interface ActiveTopicsState extends HasLoadingState {
  activeTopics: ActiveTopic[];
}

export const initialState: ActiveTopicsState = {
  activeTopics: [],
  loadingState: LoadingState.UNDEFINED
};

export const activeTopics = createFeature({
  name: activeTopicsFeatureKey,
  reducer: createReducer(
    initialState,
    on(ActiveTopicActions.addActiveTopic, (state, activeTopic): ActiveTopicsState => {
      const otherActiveTopicItems = state.activeTopics.filter((item) => item.topic !== activeTopic.topic);
      return {...state, activeTopics: [...otherActiveTopicItems, activeTopic]};
    }),
    on(ActiveTopicActions.removeActiveTopic, (state, activeTopic): ActiveTopicsState => {
      const remainingActiveTopicItems = state.activeTopics.filter((item) => item.topic !== activeTopic.topic);
      return {...state, activeTopics: [...remainingActiveTopicItems]};
    }),
    on(ActiveTopicActions.removeAllActiveTopics, (state): ActiveTopicsState => {
      return {...state, activeTopics: []};
    })
  )
});

export const {name, reducer, selectActiveTopicsState, selectActiveTopics} = activeTopics;
