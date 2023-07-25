import {createFeature, createReducer, on} from '@ngrx/store';
import {PrintState} from '../states/print.state';
import {PrintActions} from '../actions/print.actions';

export const printFeatureKey = 'print';

export const initialState: PrintState = {
  info: undefined,
  infoLoadingState: 'undefined',
  creation: undefined,
  creationLoadingState: 'undefined',
  creationResponse: undefined,
};

export const printFeature = createFeature({
  name: printFeatureKey,
  reducer: createReducer(
    initialState,
    on(PrintActions.loadPrintInfo, (state): PrintState => {
      // If we already have infos, we do not reset the state
      if (state.info) {
        return state;
      }
      return {...state, infoLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintInfo, (state, {info}): PrintState => {
      return {...state, info, infoLoadingState: 'loaded'};
    }),
    on(PrintActions.requestPrintCreation, (state, {creation}): PrintState => {
      return {...state, creation, creationLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintCreationResponse, (state, {creationResponse}): PrintState => {
      return {...state, creationResponse, creationLoadingState: 'loaded'};
    }),
    on(PrintActions.clearPrintCreation, (state): PrintState => {
      return {
        ...state,
        creation: initialState.creation,
        creationResponse: initialState.creationResponse,
        creationLoadingState: 'undefined',
      };
    }),
  ),
});

export const {name, reducer, selectInfo, selectInfoLoadingState, selectCreationLoadingState, selectCreationResponse} = printFeature;
