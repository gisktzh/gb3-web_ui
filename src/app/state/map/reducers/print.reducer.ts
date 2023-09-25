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
      return {...state, capabilitiesLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintCapabilities, (state, {info}): PrintState => {
      return {...state, capabilities: info, capabilitiesLoadingState: 'loaded'};
    }),
    on(PrintActions.requestPrintCreation, (state, {creation}): PrintState => {
      return {...state, creation, creationLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintCreationResponse, (state, {creationResponse}): PrintState => {
      return {...state, creationResponse, creationLoadingState: 'loaded'};
    }),
    on(PrintActions.setPrintRequestError, (state): PrintState => {
      return {...state, creationLoadingState: 'error'};
    }),
    on(PrintActions.setPrintCapabilitiesError, (state): PrintState => {
      return {...state, capabilitiesLoadingState: 'error'};
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
