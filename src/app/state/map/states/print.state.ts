import {PrintCapabilities, PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface PrintState {
  capabilities: PrintCapabilities | undefined;
  capabilitiesLoadingState: LoadingState;
  creation: PrintCreation | undefined;
  creationLoadingState: LoadingState;
  creationResponse: PrintCreationResponse | undefined;
}
