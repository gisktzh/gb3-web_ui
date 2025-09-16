import {PrintCapabilitiesCombination} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface PrintState {
  creation: PrintCreation | undefined;
  creationLoadingState: LoadingState;
  creationResponse: PrintCreationResponse | undefined;
  capabilitiesValidCombinations: PrintCapabilitiesCombination[] | undefined;
  capabilitiesValidCombinationsLoadingState: LoadingState;
}
