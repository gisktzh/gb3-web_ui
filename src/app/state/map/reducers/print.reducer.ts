import {createFeature, createReducer, on} from '@ngrx/store';
import {PrintState} from '../states/print.state';
import {PrintActions} from '../actions/print.actions';

export const printFeatureKey = 'print';

export const initialState: PrintState = {
  capabilities: undefined,
  capabilitiesLoadingState: 'undefined',
  creation: undefined,
  creationLoadingState: 'undefined',
  creationResponse: undefined,
};

export const printFeature = createFeature({
  name: printFeatureKey,
  reducer: createReducer(
    initialState,
    on(PrintActions.loadPrintCapabilities, (state): PrintState => {
      // If we already have infos, we do not reset the state
      if (state.capabilities) {
        return state;
      }
      return {...initialState, capabilitiesLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintCapabilities, (state, {capabilities}): PrintState => {
      return {...state, capabilities, capabilitiesLoadingState: 'loaded'};
    }),
    on(PrintActions.setPrintCapabilitiesError, (state): PrintState => {
      return {...initialState, capabilitiesLoadingState: 'error'};
    }),
    on(PrintActions.requestPrintCreation, (state, {creation}): PrintState => {
      return {...state, creation, creationLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintCreationResponse, (state, {creationResponse}): PrintState => {
      return {...state, creationResponse, creationLoadingState: 'loaded'};
    }),
    on(PrintActions.setPrintCreationError, (state): PrintState => {
      return {...state, creationLoadingState: 'error', creationResponse: initialState.creationResponse};
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

export const {name, reducer, selectCapabilities, selectCapabilitiesLoadingState, selectCreationLoadingState, selectCreationResponse} =
  printFeature;
