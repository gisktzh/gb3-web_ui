import {createFeature, createReducer, on} from '@ngrx/store';
import {PrintState} from '../states/print.state';
import {PrintActions} from '../actions/print.actions';

export const printFeatureKey = 'print';

export const initialState: PrintState = {
  creation: undefined,
  creationLoadingState: undefined,
  creationResponse: undefined,
  capabilitiesValidCombinations: undefined,
  capabilitiesValidCombinationsLoadingState: undefined,
};

export const printFeature = createFeature({
  name: printFeatureKey,
  reducer: createReducer(
    initialState,
    on(PrintActions.requestPrintCreation, (state, {creation}): PrintState => {
      return {...state, creation, creationLoadingState: 'loading'};
    }),
    on(PrintActions.setPrintRequestResponse, (state, {creationResponse}): PrintState => {
      return {...state, creationResponse, creationLoadingState: 'loaded'};
    }),
    on(PrintActions.setPrintRequestError, (state): PrintState => {
      return {...state, creationLoadingState: 'error', creationResponse: initialState.creationResponse};
    }),
    on(PrintActions.clearPrintRequest, (state): PrintState => {
      return {
        ...state,
        creation: initialState.creation,
        creationResponse: initialState.creationResponse,
        creationLoadingState: undefined,
      };
    }),
    on(PrintActions.fetchCapabilitiesValidCombinations, (state): PrintState => {
      return {
        ...state,
        capabilitiesValidCombinationsLoadingState: 'loading',
      };
    }),
    on(PrintActions.capabilitiesValidCombinationsLoaded, (state, {printCapabilitiesCombinations}): PrintState => {
      return {
        ...state,
        capabilitiesValidCombinations: printCapabilitiesCombinations,
        capabilitiesValidCombinationsLoadingState: 'loaded',
      };
    }),
  ),
});

export const {
  name,
  reducer,
  selectCreationLoadingState,
  selectCreationResponse,
  selectCapabilitiesValidCombinations,
  selectCapabilitiesValidCombinationsLoadingState,
} = printFeature;
