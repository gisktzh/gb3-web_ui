import {createFeature, createReducer, on} from '@ngrx/store';
import {ToolState} from '../states/tool.state';
import {ToolActions} from '../actions/tool.actions';

export const toolFeatureKey = 'tool';

export const initialState: ToolState = {
  activeTool: undefined
};

export const toolFeature = createFeature({
  name: toolFeatureKey,
  reducer: createReducer(
    initialState,
    on(ToolActions.toggle, (): ToolState => {
      console.log('initializing tool');
      return {...initialState, activeTool: 'measure-line'};
    })
  )
});

export const {name, reducer, selectToolState, selectActiveTool} = toolFeature;
